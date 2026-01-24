# Category Management - Testing Guide

## 🧪 Quick Test Reference

### Access the Category Management Page
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/categories`
3. Login as admin if not already logged in

---

## ✅ Test Checklist

### 1. Page Load
- [ ] Page loads without errors
- [ ] Overview stats display correctly
- [ ] Category list shows all 5 seeded categories
- [ ] Icons and colors render properly
- [ ] Active/inactive badges show correctly
- [ ] Course counts display

### 2. Create Category
**Steps**:
1. Click "Create Category" button
2. Fill in form:
   - Name: "Test Category"
   - Slug: Auto-generated (should be "test-category")
   - Description: "This is a test category"
   - Icon: Select any icon from dropdown
   - Color: Choose a color preset or custom
   - Active: Check the box
3. Click "Create Category"

**Expected**:
- [ ] Form validates correctly
- [ ] Slug auto-generates from name
- [ ] Live preview updates as you type
- [ ] Success toast appears
- [ ] New category appears in list
- [ ] Page refreshes with new data

### 3. Edit Category
**Steps**:
1. Click edit button (pencil icon) on any category
2. Modify fields:
   - Change name
   - Change icon
   - Change color
   - Update description
3. Click "Update Category"

**Expected**:
- [ ] Form pre-fills with existing data
- [ ] Changes save successfully
- [ ] Success toast appears
- [ ] Category updates in list
- [ ] Page refreshes

### 4. Toggle Status
**Steps**:
1. Click power button on any category
2. Confirm the action

**Expected**:
- [ ] Status toggles (Active ↔ Inactive)
- [ ] Badge updates immediately
- [ ] Success toast appears
- [ ] Page refreshes

### 5. Delete Category (With Courses)
**Steps**:
1. Try to delete a category that has courses
2. Confirm the action

**Expected**:
- [ ] Confirmation dialog warns about courses
- [ ] Category is deactivated (not deleted)
- [ ] Success toast explains deactivation
- [ ] Category remains in list but inactive
- [ ] Course count preserved

### 6. Delete Category (Without Courses)
**Steps**:
1. Create a new test category
2. Delete it immediately (before assigning courses)
3. Confirm the action

**Expected**:
- [ ] Confirmation dialog appears
- [ ] Category is permanently deleted
- [ ] Success toast confirms deletion
- [ ] Category removed from list
- [ ] Page refreshes

### 7. Validation Tests
**Test Invalid Name**:
- [ ] Empty name shows error
- [ ] Name < 3 characters shows error
- [ ] Name > 50 characters shows error

**Test Invalid Slug**:
- [ ] Uppercase letters not allowed
- [ ] Special characters (except hyphen) not allowed
- [ ] Duplicate slug shows error

**Test Description**:
- [ ] Optional field works when empty
- [ ] Max 500 characters enforced

### 8. UI/UX Tests
**Visual**:
- [ ] Icons render correctly
- [ ] Colors display properly
- [ ] Badges are readable
- [ ] Buttons are accessible
- [ ] Loading states show during operations

**Responsive**:
- [ ] Desktop view (1920px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] All buttons accessible on mobile
- [ ] Modal fits on small screens

**Theme**:
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Category colors visible in both themes
- [ ] Text contrast is sufficient

### 9. Error Handling
**Test Network Errors**:
- [ ] Disconnect network
- [ ] Try to create category
- [ ] Error toast appears
- [ ] Form doesn't clear
- [ ] User can retry

**Test Duplicate Slug**:
- [ ] Create category with existing slug
- [ ] Error message shows
- [ ] Form stays open
- [ ] User can fix and retry

### 10. Performance
- [ ] Page loads in < 2 seconds
- [ ] Category list renders smoothly
- [ ] Modal opens/closes smoothly
- [ ] No console errors
- [ ] No console warnings

---

## 🐛 Common Issues & Solutions

### Issue: TypeScript Error on CategoryList Import
**Symptom**: Red squiggly line under import  
**Cause**: TypeScript server cache  
**Solution**: Restart TypeScript server (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

### Issue: Categories Not Loading
**Symptom**: Empty list or loading spinner forever  
**Cause**: API endpoint not responding  
**Solution**: Check console for errors, verify database connection

### Issue: Icons Not Showing
**Symptom**: Empty boxes instead of icons  
**Cause**: Icon name mismatch  
**Solution**: Verify icon names match Lucide React exports

### Issue: Colors Not Applying
**Symptom**: All categories same color  
**Cause**: Inline styles not working  
**Solution**: Check browser console, verify color format (#RRGGBB)

---

## 📊 Expected Data

### Seeded Categories (5)
1. **Make Money & Business**
   - Slug: `business`
   - Icon: DollarSign
   - Color: #10B981 (Green)
   - Active: Yes

2. **Create Content & Video**
   - Slug: `content`
   - Icon: Video
   - Color: #8B5CF6 (Purple)
   - Active: Yes

3. **Marketing & Traffic**
   - Slug: `marketing`
   - Icon: Megaphone
   - Color: #F59E0B (Amber)
   - Active: Yes

4. **Build Apps & Tech**
   - Slug: `apps`
   - Icon: Code
   - Color: #3B82F6 (Blue)
   - Active: Yes

5. **Productivity & Tools**
   - Slug: `productivity`
   - Icon: Zap
   - Color: #EF4444 (Red)
   - Active: Yes

---

## 🔍 Debugging Tips

### Check Browser Console
```javascript
// Should see no errors
// Look for:
// - API responses (200 OK)
// - No 404s
// - No CORS errors
```

### Check Network Tab
```
GET /api/admin/categories → 200 OK
POST /api/admin/categories → 200 OK
PATCH /api/admin/categories/[id] → 200 OK
DELETE /api/admin/categories/[id] → 200 OK
```

### Check Database
```sql
-- Verify categories exist
SELECT * FROM Category;

-- Check course counts
SELECT c.name, COUNT(co.id) as course_count
FROM Category c
LEFT JOIN Course co ON co.categoryId = c.id
GROUP BY c.id, c.name;
```

---

## ✅ Success Criteria

### Functionality
- ✅ All CRUD operations work
- ✅ Validation prevents invalid data
- ✅ Smart delete logic works correctly
- ✅ Status toggle works instantly
- ✅ No console errors

### UX
- ✅ Forms are intuitive
- ✅ Feedback is immediate
- ✅ Errors are user-friendly
- ✅ Loading states are clear
- ✅ Responsive on all devices

### Performance
- ✅ Page loads quickly
- ✅ Operations complete in < 1 second
- ✅ No lag or jank
- ✅ Smooth animations

---

## 📝 Test Report Template

```markdown
## Category Management Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Local/Staging/Production]

### Test Results
- [ ] Page Load: PASS/FAIL
- [ ] Create Category: PASS/FAIL
- [ ] Edit Category: PASS/FAIL
- [ ] Delete Category: PASS/FAIL
- [ ] Toggle Status: PASS/FAIL
- [ ] Validation: PASS/FAIL
- [ ] Responsive: PASS/FAIL
- [ ] Theme Support: PASS/FAIL

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass**:
   - Mark Phase 3 as 100% complete
   - Move to Phase 4 (Frontend updates)
   - Update course forms

2. **If Issues Found**:
   - Document issues
   - Fix critical bugs
   - Re-test
   - Update documentation

---

**Happy Testing! 🎉**

