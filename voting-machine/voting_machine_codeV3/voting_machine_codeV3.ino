
//WIFI connection & API
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Keypad
#include <Keypad.h>

// LCD
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

//RFID
#include <SPI.h>
#include <MFRC522.h>
#define SS_PIN 5
#define RST_PIN 17
MFRC522 rfid(SS_PIN, RST_PIN);  // <--- เพิ่มบรรทัดนี้เพื่อประกาศสร้างตัวแปร rfid

// กำหนดพิน SDA และ SCL ชัดเจน
#define SDA_PIN 21
#define SCL_PIN 22
LiquidCrystal_I2C lcd(0x27, 16, 2);

// =====================================================
// KEYPAD
// =====================================================

const byte ROWS = 4;
const byte COLS = 3;

char keys[ROWS][COLS] = {
  { '1', '2', '3' },
  { '4', '5', '6' },
  { '7', '8', '9' },
  { '*', '0', '#' }
};

byte rowPins[ROWS] = { 13, 12, 14, 27 };
byte colPins[COLS] = { 26, 25, 33 };

Keypad customKeypad = Keypad(
  makeKeymap(keys),
  rowPins,
  colPins,
  ROWS,
  COLS);

// =====================================================
// WIFI
// =====================================================

const char* WIFI_SSID = "Win";
const char* WIFI_PASSWORD = "0809610407";

// =====================================================
// BACKEND
// =====================================================

const char* SERVER_LOGIN =
  "https://evoting-samutprakanschool-system.onrender.com/api/v1/voters/login";

const char* SERVER_PARTIES =
  "https://evoting-samutprakanschool-system.onrender.com/api/v1/parties";

const char* SERVER_CANDIDATES =
  "https://evoting-samutprakanschool-system.onrender.com/api/v1/candidates";

const char* SERVER_VOTE =
  "https://evoting-samutprakanschool-system.onrender.com/api/v1/vote";
  
// =====================================================
// STATE
// =====================================================

enum MachineState {
  ENTER_STUDENT_ID,
  ENTER_PASSWORD,
  SELECT_PARTY,
  SELECT_CANDIDATE,
  SELECT_REFERENDUM,
  CONFIRM_VOTE
};

MachineState currentState = ENTER_STUDENT_ID;


// =====================================================
// INPUT
// =====================================================

String inputStudentId = "";
String inputPassword = "";


// =====================================================
// VOTER DATA
// =====================================================

String voterId = "";
String studentId = "";
String voterDistrict = "";
String voterName = "";


// =====================================================
// SELECTED DATA
// =====================================================

String selectedPartyId = "";
String selectedPartyName = "";
int selectedPartyNumber = 0;

String selectedCandidateId = "";
String selectedCandidateName = "";
int selectedCandidateNumber = 0;

String selectedReferendum = "";


// =====================================================
// CACHE
// โหลด Party / Candidate จาก API แค่ครั้งเดียว
// =====================================================

struct Party {
  String id;
  String name;
  int number;
};

struct Candidate {
  String id;
  String firstname;
  String lastname;
  int number;
};

const int MAX_PARTIES = 20;
const int MAX_CANDIDATES = 30;

Party parties[MAX_PARTIES];
int partyCount = 0;

Candidate candidates[MAX_CANDIDATES];
int candidateCount = 0;

//กำหนดค่า
const int buzzerPin = 4;

// =====================================================
// FUNCTION PROTOTYPES
// =====================================================

void loginVoter();
void getParties();
void selectParty(int partyNumber);
void getCandidates();
void selectCandidate(int candidateNumber);
void selectReferendum();
void showConfirmation();
void sendVote();
void updateLCD();
void playKeyBeep();
void playSuccessSound();
void playErrorSound();
void checkRFID();
void resetSystem();


void setup() {

  Serial.begin(115200);
  delay(1000);

  //buzzer
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, HIGH);

  // LCD
  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();

  // --- เพิ่มการเริ่มต้น RFID ตรงนี้ ---
  SPI.begin();      // เริ่มต้นระบบสื่อสาร SPI
  rfid.PCD_Init();  // เริ่มต้นใช้งานโมดูล RFID RC522

  Serial.println();
  Serial.println("==============================");
  Serial.println("       eVoting Machine");
  Serial.println("==============================");

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 30) {

    delay(500);
    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi connection FAILED!");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi FAILED!");

    return;
  }

  Serial.println("WiFi connected!");

  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  Serial.println();
  Serial.println("Enter Student ID:");

  updateLCD();
}

void loop() {

  checkRFID();

  char key = customKeypad.getKey();

  if (!key) {
    return;
  }

  playKeyBeep();

  // ===================================================
  // ENTER STUDENT ID
  // ===================================================

  if (currentState == ENTER_STUDENT_ID) {

    if (key >= '0' && key <= '9') {

      inputStudentId += key;

      Serial.print(key);

      updateLCD();
    }

    else if (key == '#') {

      if (inputStudentId.length() == 0) {

        Serial.println();
        Serial.println("Student ID is empty!");

        return;
      }

      Serial.println();
      Serial.print("Student ID: ");
      Serial.println(inputStudentId);

      currentState = ENTER_PASSWORD;

      updateLCD();
    }

    else if (key == '*') {

      inputStudentId = "";

      Serial.println();
      Serial.println("Student ID cleared.");

      updateLCD();
    }
  }


  // ===================================================
  // ENTER PASSWORD
  // ===================================================

  else if (currentState == ENTER_PASSWORD) {

    if (key >= '0' && key <= '9') {

      inputPassword += key;

      Serial.print("*");

      updateLCD();
    }

    else if (key == '#') {

      Serial.println();

      loginVoter();
    }

    else if (key == '*') {

      inputPassword = "";

      Serial.println();
      Serial.println("Password cleared.");

      updateLCD();
    }
  }


  // ===================================================
  // SELECT PARTY
  // ===================================================

  else if (currentState == SELECT_PARTY) {

    if (key >= '0' && key <= '9') {

      int partyNumber = key - '0';

      selectParty(partyNumber);
    }
  }


  // ===================================================
  // SELECT CANDIDATE
  // ===================================================

  else if (currentState == SELECT_CANDIDATE) {

    if (key >= '0' && key <= '9') {

      int candidateNumber = key - '0';

      selectCandidate(candidateNumber);
    }
  }


  // ===================================================
  // REFERENDUM
  // ===================================================

  else if (currentState == SELECT_REFERENDUM) {

    if (key == '1') {

      selectedReferendum = "YES";

      showConfirmation();
    }

    else if (key == '2') {

      selectedReferendum = "NO";

      showConfirmation();
    }

    else if (key == '3') {

      selectedReferendum = "ABSTAIN";

      showConfirmation();
    }
  }


  // ===================================================
  // CONFIRM VOTE
  // ===================================================

  else if (currentState == CONFIRM_VOTE) {

    if (key == '#') {

      Serial.println();
      Serial.println("VOTE CONFIRMED!");

      sendVote();

      playKeyBeep();
      playKeyBeep();

    }

    else if (key == '*') {

      Serial.println("Vote cancelled.");

      resetSystem();
    }
  }
}

void loginVoter() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected!");

    return;
  }

  HTTPClient http;

  http.begin(SERVER_LOGIN);
  http.addHeader("Content-Type", "application/json");

  String jsonData =
    "{\"studentId\":\"" + inputStudentId + "\",\"password\":\"" + inputPassword + "\"}";

  int responseCode = http.POST(jsonData);

  String response = http.getString();

  http.end();

  Serial.print("Login HTTP: ");
  Serial.println(responseCode);


  // ===================================================
  // ALREADY VOTED
  // Backend ส่ง 403 เมื่อใช้สิทธิ์ไปแล้ว
  // ===================================================

  if (responseCode == 403) {

    Serial.println();
    Serial.println("==============================");
    Serial.println("       ALREADY VOTED");
    Serial.println("==============================");

    Serial.println(response);

    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("Already Voted!");

    lcd.setCursor(0, 1);
    lcd.print("No More Vote");

    delay(3000);

    resetSystem();

    return;
  }


  // ===================================================
  // OTHER LOGIN ERROR
  // ===================================================

  if (responseCode != 200) {

    Serial.println("LOGIN FAILED!");

    Serial.println("Server response:");
    Serial.println(response);

    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("Login Failed!");

    delay(2000);

    resetSystem();

    return;
  }


  // ===================================================
  // PARSE JSON
  // ===================================================

  JsonDocument doc;

  DeserializationError error =
    deserializeJson(doc, response);

  if (error) {

    Serial.println("Login JSON parsing failed!");

    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("System Error");

    delay(2000);

    resetSystem();

    return;
  }


  // ===================================================
  // SAVE VOTER DATA
  // ===================================================

  voterId =
    doc["voter"]["_id"].as<String>();

  studentId =
    doc["voter"]["studentId"].as<String>();

  voterDistrict =
    doc["voter"]["district"].as<String>();

  String firstname =
    doc["voter"]["firstname"].as<String>();

  String lastname =
    doc["voter"]["lastname"].as<String>();

  voterName =
    firstname + " " + lastname;


  // ===================================================
  // CHECK HAS VOTED
  // ===================================================

  bool hasVoted =
    doc["voter"]["hasVoted"].as<bool>();


  // ===================================================
  // ALREADY VOTED
  // ===================================================

  if (hasVoted) {

    Serial.println();
    Serial.println("==============================");
    Serial.println("   ALREADY VOTED");
    Serial.println("==============================");

    Serial.print("Voter: ");
    Serial.println(voterName);

    Serial.println("This voter has already voted.");


    // LCD

    lcd.clear();

    lcd.setCursor(0, 0);
    lcd.print("Already Voted!");

    lcd.setCursor(0, 1);
    lcd.print("No More Vote");


    delay(3000);


    // กลับหน้า Login

    resetSystem();

    return;
  }


  // ===================================================
  // LOGIN SUCCESS + NOT VOTED
  // ===================================================

  Serial.println();
  Serial.println("==============================");
  Serial.println("       LOGIN SUCCESS!");
  Serial.println("==============================");

  Serial.print("Voter ID: ");
  Serial.println(voterId);

  Serial.print("Student ID: ");
  Serial.println(studentId);

  Serial.print("Name: ");
  Serial.println(voterName);

  Serial.print("District: ");
  Serial.println(voterDistrict);

  Serial.println();


  // ===================================================
  // GET PARTIES
  // ===================================================

  getParties();
}

void getParties() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected!");
    return;
  }

  HTTPClient http;

  http.begin(SERVER_PARTIES);

  int responseCode = http.GET();

  String response = http.getString();

  http.end();

  Serial.print("Party API: ");
  Serial.println(responseCode);

  if (responseCode != 200) {

    Serial.println("Failed to get parties.");
    return;
  }


  // ===================================================
  // PARSE JSON
  // ===================================================

  JsonDocument doc;

  DeserializationError error =
    deserializeJson(doc, response);

  if (error) {

    Serial.print("Party JSON error: ");
    Serial.println(error.c_str());

    return;
  }


  // ===================================================
  // IMPORTANT
  // API response:
  //
  // {
  //   "success": true,
  //   "parties": [...]
  // }
  // ===================================================

  JsonArray array =
    doc["parties"].as<JsonArray>();

  partyCount = 0;


  // ===================================================
  // SAVE PARTIES TO RAM
  // ===================================================

  for (JsonObject party : array) {

    if (partyCount >= MAX_PARTIES) {
      break;
    }

    parties[partyCount].id =
      party["_id"].as<String>();

    parties[partyCount].name =
      party["name"].as<String>();

    parties[partyCount].number =
      party["number"].as<int>();


    Serial.print(
      parties[partyCount].number);

    Serial.print(". ");

    Serial.println(
      parties[partyCount].name);


    partyCount++;
  }


  Serial.print("Party count: ");
  Serial.println(partyCount);


  // ===================================================
  // GO TO PARTY SELECTION
  // ===================================================

  if (partyCount > 0) {

    currentState = SELECT_PARTY;

    updateLCD();

  } else {

    Serial.println("No parties found!");
  }
}

void selectParty(int partyNumber) {

  for (int i = 0; i < partyCount; i++) {

    if (parties[i].number == partyNumber) {

      selectedPartyId =
        parties[i].id;

      selectedPartyName =
        parties[i].name;

      selectedPartyNumber =
        parties[i].number;


      Serial.println();
      Serial.println("PARTY SELECTED");

      Serial.print("Number: ");
      Serial.println(selectedPartyNumber);

      Serial.print("Party: ");
      Serial.println(selectedPartyName);

      selectedPartyNumber = partyNumber;

      // โหลด Candidate
      // เพียงครั้งเดียว

      getCandidates();

      return;
    }
  }


  Serial.println("Party not found!");
}

void getCandidates() {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected!");
    return;
  }

  HTTPClient http;

  String url =
    String(SERVER_CANDIDATES) + "?district=" + voterDistrict;

  Serial.print("Getting candidates: ");
  Serial.println(url);

  http.begin(url);

  int responseCode = http.GET();

  String response = http.getString();

  http.end();

  Serial.print("Candidate API: ");
  Serial.println(responseCode);

  if (responseCode != 200) {
    Serial.println("Failed to get candidates.");
    return;
  }

  // ===================================================
  // PARSE JSON
  // ===================================================

  JsonDocument doc;

  DeserializationError error =
    deserializeJson(doc, response);

  if (error) {
    Serial.print("Candidate JSON error: ");
    Serial.println(error.c_str());
    return;
  }

  // ===================================================
  // API RESPONSE:
  //
  // {
  //   "success": true,
  //   "candidates": [...]
  // }
  // ===================================================

  JsonArray array =
    doc["candidates"].as<JsonArray>();

  candidateCount = 0;

  // ===================================================
  // SAVE CANDIDATES TO RAM
  // ===================================================

  for (JsonObject candidate : array) {

    if (candidateCount >= MAX_CANDIDATES) {
      break;
    }

    candidates[candidateCount].id =
      candidate["_id"].as<String>();

    candidates[candidateCount].firstname =
      candidate["firstname"].as<String>();

    candidates[candidateCount].lastname =
      candidate["lastname"].as<String>();

    candidates[candidateCount].number =
      candidate["number"].as<int>();

    Serial.print(
      candidates[candidateCount].number);

    Serial.print(". ");

    Serial.print(
      candidates[candidateCount].firstname);

    Serial.print(" ");

    Serial.println(
      candidates[candidateCount].lastname);

    candidateCount++;
  }

  Serial.print("Candidate count: ");
  Serial.println(candidateCount);

  // ===================================================
  // GO TO CANDIDATE SELECTION
  // ===================================================

  if (candidateCount > 0) {

    currentState = SELECT_CANDIDATE;

    updateLCD();

  } else {

    Serial.println("No candidates found!");
  }
}

void selectCandidate(int candidateNumber) {

  for (int i = 0; i < candidateCount; i++) {

    if (candidates[i].number == candidateNumber) {

      selectedCandidateId =
        candidates[i].id;

      selectedCandidateName =
        candidates[i].firstname + " " + candidates[i].lastname;


      Serial.println();
      Serial.println("CANDIDATE SELECTED");

      Serial.print("Number: ");
      Serial.println(candidates[i].number);

      Serial.print("Candidate: ");
      Serial.println(selectedCandidateName);

      selectedCandidateNumber = candidateNumber;

      selectReferendum();

      return;
    }
  }


  Serial.println("Candidate not found!");
}

void selectReferendum() {

  Serial.println();
  Serial.println("REFERENDUM");

  Serial.println("1. เห็นด้วย");
  Serial.println("2. ไม่เห็นด้วย");
  Serial.println("3. งดออกเสียง");


  currentState = SELECT_REFERENDUM;

  updateLCD();
}

void showConfirmation() {

  Serial.println("\n==============================\n        CONFIRM VOTE\n==============================");
  Serial.println("Voter: " + voterName);
  Serial.println("Party: " + selectedPartyName);
  Serial.println("Candidate: " + selectedCandidateName);
  Serial.println("Referendum: " + selectedReferendum);

  currentState = CONFIRM_VOTE;

  // --- หน้าที่ 1: แสดงข้อมูลผู้ลงคะแนน ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Voter: " + voterName.substring(0, 9));  // ตัดคำไม่ให้เกิน 16 ตัวอักษร
  lcd.setCursor(0, 1);
  lcd.print("District: " + voterDistrict.substring(0, 10));
  delay(3000);  // ค้างไว้ 3 วินาที

  // --- หน้าที่ 2: แสดงหมายเลขพรรคและหมายเลขผู้สมัคร ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Party No.: ");
  lcd.print(selectedPartyNumber);  // แสดงเบอร์พรรคที่กด (เช่น 1, 2, 3)

  lcd.setCursor(0, 1);
  lcd.print("Cand. No.: ");
  lcd.print(selectedCandidateNumber);  // แสดงเบอร์ผู้สมัครที่กด (เช่น 1, 2, 5)

  delay(3000);  // ค้างไว้ 3 วินาที

  // --- หน้าที่ 3: แสดงประเด็นลงมติและคำสั่งกดปุ่ม ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Ref: ");
  lcd.print(selectedReferendum);  // แสดง YES, NO หรือ ABSTAIN
  lcd.setCursor(0, 1);
  lcd.print("#:OK   *:CANCEL");
}

void sendVote() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected!");

    return;
  }

  HTTPClient http;

  http.begin(SERVER_VOTE);

  http.addHeader(
    "Content-Type",
    "application/json");

  String referendumThai;

  if (selectedReferendum == "YES") {
    referendumThai = "เห็นด้วย";
  } else if (selectedReferendum == "NO") {
    referendumThai = "ไม่เห็นด้วย";
  } else if (selectedReferendum == "ABSTAIN") {
    referendumThai = "งดออกเสียง";
  }

  String jsonData =
    "{"
    "\"voter\":\""
    + voterId + "\","
                "\"party\":\""
    + selectedPartyId + "\","
                        "\"candidate\":\""
    + selectedCandidateId + "\","
                            "\"referendum\":\""
    + referendumThai + "\""
                           "}";


  Serial.println();
  Serial.println("SENDING VOTE");


  int responseCode =
    http.POST(jsonData);

  String response =
    http.getString();

  Serial.print("Vote HTTP: ");
  Serial.println(responseCode);

  Serial.print("Server response: ");
  Serial.println(response);

  http.end();


  Serial.print("Vote HTTP: ");
  Serial.println(responseCode);


  if (responseCode == 201) {

    Serial.println();
    Serial.println("VOTE SUCCESS!");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(" VOTE SUCCESS! ");
    lcd.setCursor(0, 1);
    lcd.print("   Thank You!!  ");

    playSuccessSound();  // <--- ใส่เสียงส่งสำเร็จตรงนี้
    delay(2000);
  }

  else {

    Serial.println();
    Serial.println("VOTE FAILED!");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("  VOTE FAILED!  ");

    playErrorSound();  // <--- ใส่เสียงส่งล้มเหลวตรงนี้
    delay(2000);
  }

  resetSystem();
}

void updateLCD() {

  lcd.clear();


  switch (currentState) {

    case ENTER_STUDENT_ID:

      lcd.setCursor(0, 0);
      lcd.print("Enter Student ID");

      lcd.setCursor(0, 1);
      lcd.print(inputStudentId);

      break;


    case ENTER_PASSWORD:

      lcd.setCursor(0, 0);
      lcd.print("Enter Password:");

      lcd.setCursor(0, 1);

      for (
        int i = 0;
        i < inputPassword.length();
        i++) {

        lcd.print("*");
      }

      break;


    case SELECT_PARTY:

      lcd.setCursor(0, 0);
      lcd.print("Select Party:");

      lcd.setCursor(0, 1);
      lcd.print("Press 1-6");

      break;


    case SELECT_CANDIDATE:

      lcd.setCursor(0, 0);
      lcd.print("Select Candidate");

      lcd.setCursor(0, 1);
      lcd.print("Press 1-6");

      break;


    case SELECT_REFERENDUM:

      lcd.setCursor(0, 0);
      lcd.print("1:Yes 2:No 3:Abs");

      break;


    case CONFIRM_VOTE:

      lcd.setCursor(0, 0);
      lcd.print("#:Confirm Vote");

      lcd.setCursor(0, 1);
      lcd.print("*:Cancel");

      break;
  }
}

void playKeyBeep() {
  digitalWrite(buzzerPin, LOW);   // เปิดเสียง
  delay(40);                      // ดังนาน 40 ms
  digitalWrite(buzzerPin, HIGH);  // ปิดเสียง
}

void playSuccessSound() {
  digitalWrite(buzzerPin, LOW);  // บี๊บ ครั้งที่ 1
  delay(80);
  digitalWrite(buzzerPin, HIGH);  // หยุดพัก
  delay(80);

  digitalWrite(buzzerPin, LOW);  // บี๊บ ครั้งที่ 2
  delay(120);
  digitalWrite(buzzerPin, HIGH);  // ปิดเสียง
}

void playErrorSound() {
  digitalWrite(buzzerPin, LOW);   // เปิดเสียงยาว
  delay(500);                     // ดังนาน 500 ms
  digitalWrite(buzzerPin, HIGH);  // ปิดเสียง
}

void checkRFID() {
  // ตรวจสอบว่ามีบัตรมาแตะหรือไม่
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  // อ่านค่า UID จากบัตรเปล่า แปลงเป็น String ตัวอักษรใหญ่ (เช่น "4A8B12C3")
  String cardUID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    cardUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    cardUID += String(rfid.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();

  // ส่งเสียงบี๊บยืนยันการรับค่าบัตร
  playKeyBeep();

  // นำค่า UID ที่อ่านได้ไปเก็บใส่ inputStudentId
  inputStudentId = cardUID;

  Serial.println();
  Serial.print("RFID Scanned UID: ");
  Serial.println(inputStudentId);

  // สั่งหยุดการสื่อสารกับบัตรใบเดิมชั่วคราว (กันอ่านซ้ำ)
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // เปลี่ยนสถานะไปหน้าใส่รหัสผ่านทันที
  currentState = ENTER_PASSWORD;
  updateLCD();
}

void resetSystem() {

  inputStudentId = "";
  inputPassword = "";

  voterId = "";
  studentId = "";
  voterDistrict = "";
  voterName = "";

  selectedPartyId = "";
  selectedPartyName = "";
  selectedPartyNumber = 0;

  selectedCandidateId = "";
  selectedCandidateName = "";
  selectedCandidateNumber = 0;

  selectedReferendum = "";


  // Clear cached data

  partyCount = 0;
  candidateCount = 0;


  currentState = ENTER_STUDENT_ID;

  updateLCD();


  Serial.println();
  Serial.println("==============================");
  Serial.println("     SYSTEM READY");
  Serial.println("==============================");
  Serial.println("Enter Student ID:");
}