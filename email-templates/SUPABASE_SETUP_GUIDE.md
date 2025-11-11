# Quick Setup Guide for Supabase Email Templates

Follow these steps to configure your beautiful email templates in Supabase.

## 🚀 Quick Start (5 Minutes)

### Step 1: Access Supabase Email Templates

1. Open your Supabase project dashboard: https://supabase.com/dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Email Templates**

You'll see 5 default templates:
- ✅ Confirm signup
- ✅ Invite user
- ✅ Magic Link
- ✅ Reset Password
- ⚠️ Change Email Address (not included - uses similar structure to confirm signup)

---

### Step 2: Update Templates One by One

#### 📧 Template 1: Confirm Signup

1. Click **Confirm signup** in Supabase
2. Open `email-confirmation.html` from this directory
3. Copy all the HTML content (select all, Ctrl+A / Cmd+A)
4. Paste into Supabase's template editor (replace everything)
5. Click **Save** at the bottom

✅ Done! Your signup confirmation emails will now look beautiful.

---

#### 📧 Template 2: Invite User

1. Click **Invite User** in Supabase
2. Open `invite-user.html` from this directory
3. **Important**: Before copying, you need to make changes because Supabase doesn't support custom variables like inviter name

**Option A - Simple (Recommended)**: Remove personalization sections

Find and remove these lines (around line 70-100):

```html
<!-- Remove this entire block: -->
<tr>
    <td style="padding: 0 0 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid #D4AF37; border-radius: 4px;">
            <tr>
                <td style="padding: 18px 20px;">
                    <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.5; color: #555555; font-weight: 600;">Personal Message:</p>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #666666; font-style: italic;">"{{ .InviterMessage }}"</p>
                </td>
            </tr>
        </table>
    </td>
</tr>
```

And replace references to `{{ .InviterName }}` with generic text like "A family member"

**Option B - Advanced**: Implement custom invite system (see README.md for code example)

4. Replace `{{ .InviteURL }}` with `{{ .ConfirmationURL }}` (Supabase's variable name)
5. Copy the modified HTML and paste into Supabase
6. Click **Save**

---

#### 📧 Template 3: Magic Link

1. Click **Magic Link** in Supabase
2. Open `magic-link.html` from this directory
3. Find and replace: `{{ .MagicLinkURL }}` → `{{ .ConfirmationURL }}`
   - Ctrl+H / Cmd+H to open find-replace
   - Replace all occurrences
4. Copy all the HTML content
5. Paste into Supabase's template editor
6. Click **Save**

---

#### 📧 Template 4: Reset Password

1. Click **Reset Password** in Supabase
2. Open `password-reset.html` from this directory
3. Find and replace: `{{ .ResetURL }}` → `{{ .ConfirmationURL }}`
4. Copy all the HTML content
5. Paste into Supabase's template editor
6. Click **Save**

---

### Step 3: Test Your Templates

#### Test Signup Confirmation:

```bash
# Make sure your dev server is running
yarn dev

# Go to signup page and create a test account
# Open: http://localhost:3000/signup
```

Check your email inbox - you should see the beautiful confirmation email!

#### Test Password Reset:

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click on a user
3. Click **Send password reset email**
4. Check your inbox

---

## 🎨 Customization Options

### Add Your Logo

In each template, find this section (near the top):

```html
<h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 600; color: #0F5F4A; letter-spacing: 1px;">Shajra</h1>
```

Replace with:

```html
<img src="YOUR_LOGO_URL_HERE" alt="Shajra Logo" width="200" height="auto" style="display: block; max-width: 200px; height: auto;">
```

**Logo requirements:**
- Use absolute URL (https://yourdomain.com/logo.png)
- PNG format with transparent background
- Recommended width: 200-400px
- Host on a reliable CDN (Supabase Storage, Cloudinary, etc.)

### Change Colors

Find and replace these hex codes in all templates:

| Color Name | Current Value | Replace With |
|------------|---------------|--------------|
| Primary Green | `#0F5F4A` | Your color |
| Gold Accent | `#D4AF37` | Your color |
| Teal | `#14B8A6` | Your color |
| Background | `#FDFBF7` | Your color |

### Update Footer Links

At the bottom of each template, find:

```html
<a href="https://yourwebsite.com" style="...">Website</a>
```

Replace with your actual URLs:
- Website URL
- Support/Help URL
- Privacy Policy URL
- Terms of Service URL

---

## 📝 Supabase Variable Reference

When editing templates, use only these Supabase-supported variables:

| Variable | Description | Works In |
|----------|-------------|----------|
| `{{ .ConfirmationURL }}` | Main action link | All templates |
| `{{ .Token }}` | Verification token | All templates |
| `{{ .TokenHash }}` | Hashed token | All templates |
| `{{ .SiteURL }}` | Your site URL | All templates |
| `{{ .Email }}` | User's email | All templates |

**Note**: Custom variables like `{{ .InviterName }}` don't work in Supabase's default templates. For advanced personalization, you need custom email sending (see README.md).

---

## ⚙️ Optional: Configure Custom SMTP

For better deliverability and custom "from" address:

### Option 1: Resend (Recommended - Easy Setup)

1. Sign up at https://resend.com (Free: 3,000 emails/month)
2. Get your API key
3. In Supabase: **Project Settings** → **Auth** → **SMTP Settings**
4. Enable "Use custom SMTP"
5. Configure:
   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key]
   From Email: noreply@yourdomain.com
   ```

### Option 2: SendGrid

1. Sign up at https://sendgrid.com (Free: 100 emails/day)
2. Create API key with "Mail Send" permission
3. Configure in Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   From Email: noreply@yourdomain.com
   ```

### Option 3: AWS SES

1. Set up AWS SES (Very cheap: $0.10 per 1,000 emails)
2. Verify your domain
3. Get SMTP credentials
4. Configure in Supabase with your SES SMTP settings

**Important**: After configuring custom SMTP:
- Add SPF record to your domain DNS
- Add DKIM record to your domain DNS
- Both improve deliverability and reduce spam scores

---

## ✅ Testing Checklist

After setup, verify:

- [ ] Signup confirmation email received
- [ ] Email looks good on desktop
- [ ] Email looks good on mobile
- [ ] All links work correctly
- [ ] Logo displays (if added)
- [ ] Colors match your brand
- [ ] Footer links are correct
- [ ] Password reset email works
- [ ] Emails not going to spam

---

## 🐛 Common Issues & Fixes

### Issue: Email not received

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Supabase email confirmation is enabled (Settings → Auth → Email)

### Issue: Template not updating

**Solution:**
1. Make sure you clicked **Save**
2. Clear browser cache (Ctrl+Shift+R)
3. Wait 1-2 minutes for changes to propagate

### Issue: Variables showing as {{ .ConfirmationURL }}

**Solution:**
- Variables are only replaced in actual emails, not in the preview
- Send a test email to see the real result

### Issue: Button links not working

**Solution:**
- Ensure you're using `{{ .ConfirmationURL }}` (with the dot)
- Check for typos in variable names

### Issue: Styling looks broken in Outlook

**Solution:**
- This is expected - Outlook uses Word's rendering engine
- The templates are optimized but may look slightly different
- Main content and buttons will still work

---

## 📚 Need Help?

- **Template Design Issues**: See `README.md` in this directory
- **Supabase Auth Issues**: https://supabase.com/docs/guides/auth
- **Email Deliverability**: Check SMTP provider documentation

---

**Estimated Setup Time**: 5-10 minutes
**Difficulty**: Easy
**Last Updated**: 2025-11-11
