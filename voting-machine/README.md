require

-library
arduinojson by benoit
keypad by mark stanley, alexander brevig
liquidcrystal_i2c by martin
-software I use
arduino ide
-hardware
esp32 
lcd
keypad

ต่อสาย
keypad - esp32
1-g13
2-g12
3-g14
4-g27
5-g26
6-g25
7-g33

lcd - esp32
vvc-v5
gnd-gnd
scl-g22
sda-g21


buzzer - esp32
gnd-gnd
i/o-g4
vcc-3v3

rfid rc522 - esp32
sda-g5
sck-g18
mosi-g23
miso-g19
rst-g17
irq-nc (ปล่อยว่าง)
gnd-gnd
3.3v-3v3