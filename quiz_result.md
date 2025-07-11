**Goal:**
Update the grammar quiz logic to do **only** the following:

✅ **Identify and score the user on these 4 constructions exclusively:**

1. **Iḍāfa** (إضافة)
2. **Jar wa Majrūr** (preposition + noun)
3. **Fiʿl–Fāʿil** (verb + subject)
4. **Harf Nasb + Ismuha** (accusative particle + its noun)

✅ **Filtering:**

* Only **include verses containing *at least one* of these 4 constructions.**
* If a verse does **not** contain any of these constructions, **exclude it from practice** and **do not show it to the user.**

✅ **Scoring Display:**

* When a user attempts the question, show **which of the 4 constructions they correctly identified.**
* If there are 2, 3, or 4 constructions present, the feedback must clearly indicate which ones were correct or missed.
* Example Feedback:

  ```
  You identified 2 of 3 constructions correctly:
  ✅ Iḍāfa: Correct
  ✅ Fiʿl–Fāʿil: Correct
  ✗ Harf Nasb: Missed
  ```

✅ **Scoring Logic:**

* Award partial credit proportionally (e.g., 2/3 = 67%).
* If none were identified, score = 0%.

✅ **Additional Behavior:**

* Do **not** show “nearly there” or generic feedback if none of the 4 constructions are in the verse—simply **hide that verse**.
* All other morphological details (gender agreement, case endings) are **ignored** for scoring purposes unless they belong to one of these 4 categories.

✅ **Implementation Steps:**

1. **Add filtering step** to exclude verses with no matches for any of the 4 categories.
2. Update your construction detection logic to flag only those 4.
3. Modify scoring output to list **only these 4 categories**.
4. Update frontend to display the category-by-category correctness.

