### Concurrent Voting Test

**Status:** Not tested

**Objective:** Verify that simultaneous voting requests using the same voting authorization cannot create more than one ballot.

**Reason:** Concurrent request testing has not yet been performed due to current testing limitations.

**Expected result:**
- At most one request succeeds.
- No more than one ballot is created for the same voting authorization.
- The authorization cannot be consumed more than once.

**Note:** The voting service uses a database transaction and `SELECT ... FOR UPDATE` to protect the authorization record. However, the expected behavior under concurrent requests has not yet been verified through a dedicated test.