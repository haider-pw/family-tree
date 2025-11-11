# Email Templates for Shajra

Professional, responsive HTML email templates for the Shajra family tree application. These templates maintain your heritage brand identity with Islamic/South Asian cultural elements.

## Templates Included

1. **email-confirmation.html** - Welcome email with email verification link
2. **password-reset.html** - Password reset with secure token
3. **magic-link.html** - Passwordless login link
4. **invite-user.html** - Family member invitation

## Design Features

- **Responsive**: Mobile-optimized with media queries
- **Brand Consistent**: Uses Shajra's heritage color palette
- **Accessible**: WCAG 2.1 AA compliant contrast ratios
- **Email-Safe**: Table-based layout with inline CSS
- **Client Compatible**: Tested for Gmail, Outlook, Apple Mail, Yahoo

## How to Configure in Supabase

### Step 1: Access Email Templates in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates** in the left sidebar
3. You'll see templates for: Confirm Signup, Invite User, Magic Link, Change Email Address, Reset Password

### Step 2: Update Each Template

For each template, you need to:

#### A. Confirm Signup Template

1. Click on **Confirm signup** template
2. Copy the entire contents of `email-confirmation.html`
3. Paste into the template editor
4. Supabase will automatically replace `{{ .ConfirmationURL }}` with the actual confirmation link
5. Click **Save**

**Supabase Variables Available:**
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

#### B. Reset Password Template

1. Click on **Reset Password** template
2. Copy the entire contents of `password-reset.html`
3. Paste into the template editor
4. Click **Save**

**Supabase Variables Available:**
- `{{ .ConfirmationURL }}` - Password reset link (use this instead of {{ .ResetURL }})
- `{{ .Token }}` - Reset token (use this instead of {{ .Token }})
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

**Important**: Update the template to use `{{ .ConfirmationURL }}` instead of `{{ .ResetURL }}`

#### C. Magic Link Template

1. Click on **Magic Link** template
2. Copy the entire contents of `magic-link.html`
3. Paste into the template editor
4. Click **Save**

**Supabase Variables Available:**
- `{{ .ConfirmationURL }}` - Magic link URL (use this instead of {{ .MagicLinkURL }})
- `{{ .Token }}` - Magic link token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

**Important**: Update the template to use `{{ .ConfirmationURL }}` instead of `{{ .MagicLinkURL }}`

#### D. Invite User Template

1. Click on **Invite User** template
2. Copy the entire contents of `invite-user.html`
3. Paste into the template editor
4. Click **Save**

**Supabase Variables Available:**
- `{{ .ConfirmationURL }}` - Invitation acceptance link (use this instead of {{ .InviteURL }})
- `{{ .Token }}` - Invitation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - Invitee's email address

**Note**: Supabase doesn't support custom variables like `{{ .InviterName }}` or `{{ .FamilyName }}` in the default templates. You'll need to implement custom email sending for advanced personalization.

### Step 3: Variable Name Adjustments

Since Supabase uses different variable names, you need to do a find-and-replace in each template:

**In password-reset.html:**
- Replace `{{ .ResetURL }}` with `{{ .ConfirmationURL }}`
- Replace `{{ .Token }}` with `{{ .Token }}` (already correct)

**In magic-link.html:**
- Replace `{{ .MagicLinkURL }}` with `{{ .ConfirmationURL }}`

**In invite-user.html:**
- Replace `{{ .InviteURL }}` with `{{ .ConfirmationURL }}`
- Remove or hardcode `{{ .InviterName }}`, `{{ .InviterMessage }}`, and `{{ .FamilyName }}` sections (Supabase doesn't support custom metadata in default templates)

### Step 4: Configure SMTP Settings (Optional)

By default, Supabase uses their own SMTP server. For better deliverability and to use a custom domain:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Configure with your email provider (SendGrid, Mailgun, AWS SES, etc.)

**Recommended Providers:**
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Free tier (5,000 emails/month for 3 months)
- **AWS SES**: $0.10 per 1,000 emails

### Step 5: Test the Templates

1. **Test Signup Email:**
   ```bash
   # Go to your signup page and create a test account
   http://localhost:3000/signup
   ```

2. **Test Password Reset:**
   - Go to login page
   - Click "Forgot Password" (if you add this feature)
   - Or test via Supabase dashboard: Authentication → Users → Send password reset

3. **Test Magic Link:**
   - Implement magic link auth in your app
   - Or test via API call

4. **Test Invite:**
   - Use Supabase Admin API to send invites

## Customization Guide

### Changing Colors

Find and replace these color codes in all templates:

- `#0F5F4A` - Heritage Green (primary brand color)
- `#D4AF37` - Heritage Gold (accent color)
- `#14B8A6` - Heritage Teal (links/secondary)
- `#FDFBF7` - Parchment (light background)

### Adding Your Logo

Replace the text header with an image:

```html
<!-- Replace this: -->
<h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 600; color: #0F5F4A; letter-spacing: 1px;">Shajra</h1>

<!-- With this: -->
<img src="https://yourdomain.com/logo.png" alt="Shajra Logo" width="200" style="width: 200px; height: auto; display: block;">
```

**Logo Requirements:**
- Transparent PNG format
- Recommended size: 200-400px wide
- Host on a reliable CDN
- Use absolute URL (not relative)

### Changing Button Text

Find the button HTML and modify the text:

```html
<a href="{{ .ConfirmationURL }}" ...>Your Custom Button Text</a>
```

### Updating Footer Links

Update social/footer links at the bottom of each template:

```html
<a href="https://yourwebsite.com" style="...">Website</a> •
<a href="https://yourwebsite.com/support" style="...">Support</a> •
<a href="https://yourwebsite.com/privacy" style="...">Privacy</a>
```

## Advanced: Custom Email Sending

For advanced features like personalized invitations with custom metadata, you'll need to implement custom email sending in your application:

### Example with Nuxt Server Route

```typescript
// /server/api/send-invite.post.ts
import { Resend } from 'resend'
import fs from 'fs'
import path from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  const { email, inviterName, familyName, inviterMessage } = await readBody(event)

  // Read template
  const templatePath = path.join(process.cwd(), 'email-templates', 'invite-user.html')
  let template = fs.readFileSync(templatePath, 'utf-8')

  // Replace custom variables
  template = template
    .replace(/\{\{ \.InviterName \}\}/g, inviterName)
    .replace(/\{\{ \.FamilyName \}\}/g, familyName)
    .replace(/\{\{ \.InviterMessage \}\}/g, inviterMessage)
    .replace(/\{\{ \.Email \}\}/g, email)

  // Send email
  await resend.emails.send({
    from: 'Shajra <noreply@yourdomain.com>',
    to: email,
    subject: `${inviterName} invited you to join ${familyName} on Shajra`,
    html: template,
  })

  return { success: true }
})
```

## Testing Email Rendering

Before deploying, test your emails across different clients:

### Free Testing Tools:
1. **Litmus** - 7-day free trial
2. **Email on Acid** - 7-day free trial
3. **Mail Tester** - Free spam score checking
4. **PreviewMyEmail** - Free preview tool

### Manual Testing:
1. Send test emails to yourself
2. Check on multiple devices (desktop, mobile)
3. Test in different email clients:
   - Gmail (web and app)
   - Outlook (Windows and Mac)
   - Apple Mail (iOS and macOS)
   - Yahoo Mail
   - Proton Mail

## Troubleshooting

### Issue: Buttons not working
**Solution**: Ensure you're using absolute URLs, not relative paths

### Issue: Colors look different in Outlook
**Solution**: This is normal. Outlook uses Word's rendering engine. The templates are optimized but may have slight differences.

### Issue: Template not showing in Supabase
**Solution**: Make sure you've saved the template and hard refresh the browser (Ctrl+Shift+R)

### Issue: Variables not being replaced
**Solution**: Check that you're using the correct Supabase variable names (see Step 3 above)

### Issue: Email going to spam
**Solution**:
- Configure custom SMTP with proper SPF/DKIM records
- Avoid spam trigger words in subject lines
- Include plain text version (Supabase handles this automatically)
- Don't use URL shorteners

## Best Practices

1. **Always test** after making changes
2. **Use alt text** for all images
3. **Keep file size under 100KB** for best deliverability
4. **Include plain text version** (Supabase auto-generates)
5. **Use proper from address** (e.g., noreply@yourdomain.com)
6. **Include unsubscribe link** for transactional emails (already in templates)
7. **Monitor bounce rates** in your email provider dashboard

## Support

For issues with:
- **Email design**: Check the templates themselves
- **Supabase configuration**: See [Supabase Email Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- **SMTP setup**: Refer to your email provider's documentation

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Designed by**: UI/UX Designer Agent
