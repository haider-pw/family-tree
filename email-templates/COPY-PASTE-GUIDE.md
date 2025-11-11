# 📧 Copy & Paste Email Templates to Supabase

**⏱️ Time Required:** 5 minutes
**✅ You have:** Supabase-ready templates prepared

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Open your browser
2. Go to: **https://supabase.com/dashboard**
3. Click on your **Shajra project**
4. In the left sidebar, click **"Authentication"**
5. Click **"Email Templates"**

You should see 4 templates:
- ✉️ Confirm signup
- ✉️ Invite user
- ✉️ Magic Link
- ✉️ Reset Password

---

### Step 2: Update "Confirm Signup" Template

**In Supabase:**
1. Click on **"Confirm signup"**
2. You'll see a text editor with the current template
3. **Select All** (Ctrl+A or Cmd+A)
4. **Delete** the current template

**In Your Project:**
1. Open the file: `email-templates/supabase-ready/email-confirmation.html`
2. **Select All** (Ctrl+A or Cmd+A)
3. **Copy** (Ctrl+C or Cmd+C)

**Back in Supabase:**
1. **Paste** the template into the editor (Ctrl+V or Cmd+V)
2. Scroll to the bottom
3. Click **"Save"** button
4. ✅ You should see "Template saved successfully"

---

### Step 3: Update "Reset Password" Template

**In Supabase:**
1. Click on **"Reset Password"**
2. **Select All** (Ctrl+A or Cmd+A)
3. **Delete**

**In Your Project:**
1. Open: `email-templates/supabase-ready/password-reset.html`
2. **Select All** → **Copy**

**Back in Supabase:**
1. **Paste** into editor
2. Click **"Save"**
3. ✅ Done!

---

### Step 4: Update "Magic Link" Template (Optional)

**In Supabase:**
1. Click on **"Magic Link"**
2. **Select All** → **Delete**

**In Your Project:**
1. Open: `email-templates/supabase-ready/magic-link.html`
2. **Select All** → **Copy**

**Back in Supabase:**
1. **Paste**
2. **Save**
3. ✅ Done!

---

### Step 5: Update "Invite User" Template (Optional)

**In Supabase:**
1. Click on **"Invite User"**
2. **Select All** → **Delete**

**In Your Project:**
1. Open: `email-templates/supabase-ready/invite-user.html`
2. **Select All** → **Copy**

**Back in Supabase:**
1. **Paste**
2. **Save**
3. ✅ Done!

---

## 🧪 Test Your Templates

### Test Signup Confirmation Email

```bash
# 1. Go to your signup page
http://localhost:3000/signup

# 2. Create a new test account (use a different email)
Email: test123@example.com
Password: Test@1234

# 3. Check your email inbox
# 4. You should see a BEAUTIFUL email with:
#    - Heritage green/gold/teal gradient bar
#    - "Shajra" branding
#    - "Assalamu Alaikum" greeting
#    - Professional glass-morphism design
```

### Test Password Reset Email

```bash
# 1. Go to login page
http://localhost:3000/login

# 2. Click "Forgot password?"

# 3. Enter your email and click "Send Reset Link"

# 4. Check your inbox for beautiful password reset email
```

---

## 📸 What You Should See

### Before (Default Supabase):
- Plain white background
- Simple blue link
- Basic text layout
- Generic design

### After (Your Beautiful Template):
- ✨ Heritage green/gold/teal gradient header
- 📜 "Shajra - PRESERVING YOUR HERITAGE" branding
- 🎨 Glass morphism design with parchment background
- 💎 Islamic geometric patterns
- 🌙 "Assalamu Alaikum" cultural greeting
- 🔒 Security notices with gold accents
- 📱 Mobile responsive
- ✅ Professional button styling

---

## ❓ Troubleshooting

### Issue: Template not updating

**Solution:**
- Make sure you clicked "Save" button
- Hard refresh your browser (Ctrl+Shift+R)
- Wait 1-2 minutes for changes to propagate
- Clear browser cache

### Issue: Variables showing as {{ .ConfirmationURL }}

**Solution:**
- This is normal in the preview
- Variables are replaced in actual sent emails
- Send a test email to see the real result

### Issue: Template looks broken

**Solution:**
- Make sure you copied the ENTIRE template
- Check that you used files from `supabase-ready/` folder
- Verify no extra characters were added during copy/paste

### Issue: Email not received

**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Supabase logs: Authentication → Logs

### Issue: Can't find the templates

**Solution:**
```bash
# From project root:
cd email-templates/supabase-ready
ls -la

# You should see:
# - email-confirmation.html
# - password-reset.html
# - magic-link.html
# - invite-user.html
```

---

## 📝 Quick Reference

### Supabase Dashboard Path:
```
supabase.com/dashboard
→ Your Project
→ Authentication (left sidebar)
→ Email Templates
```

### Template Files Location:
```
/home/haider/shajra/email-templates/supabase-ready/
├── email-confirmation.html  ← Use for "Confirm signup"
├── password-reset.html      ← Use for "Reset Password"
├── magic-link.html          ← Use for "Magic Link"
└── invite-user.html         ← Use for "Invite User"
```

---

## ✅ Checklist

After completing all steps, verify:

- [ ] Opened Supabase dashboard
- [ ] Updated "Confirm signup" template
- [ ] Updated "Reset Password" template
- [ ] Updated "Magic Link" template (optional)
- [ ] Updated "Invite User" template (optional)
- [ ] Clicked "Save" for each template
- [ ] Tested by creating new account
- [ ] Received beautiful email in inbox
- [ ] All links in email work correctly

---

## 🎉 Success!

Once configured, every email sent by Supabase will use your beautiful, branded templates!

**Need help?** See `README.md` in the email-templates folder for more details.

---

**Last Updated:** 2025-11-11
**Estimated Time:** 5 minutes
**Difficulty:** Easy ⭐
