#!/bin/bash

# Script to prepare email templates for Supabase
# This creates Supabase-ready versions with correct variable names

echo "📧 Preparing email templates for Supabase..."
echo ""

# Create a supabase-ready directory
mkdir -p email-templates/supabase-ready

# 1. Email Confirmation - Already correct
echo "✅ Copying email-confirmation.html (no changes needed)"
cp email-templates/email-confirmation.html email-templates/supabase-ready/email-confirmation.html

# 2. Password Reset - Replace .ResetURL with .ConfirmationURL
echo "🔄 Processing password-reset.html"
sed 's/{{ \.ResetURL }}/{{ .ConfirmationURL }}/g' email-templates/password-reset.html > email-templates/supabase-ready/password-reset.html

# 3. Magic Link - Replace .MagicLinkURL with .ConfirmationURL
echo "🔄 Processing magic-link.html"
sed 's/{{ \.MagicLinkURL }}/{{ .ConfirmationURL }}/g' email-templates/magic-link.html > email-templates/supabase-ready/magic-link.html

# 4. Invite User - Replace .InviteURL with .ConfirmationURL and remove custom vars
echo "🔄 Processing invite-user.html"
sed 's/{{ \.InviteURL }}/{{ .ConfirmationURL }}/g' email-templates/invite-user.html | \
  sed 's/{{ \.InviterName }}/A family member/g' | \
  sed 's/{{ \.FamilyName }}/Your Family Tree/g' | \
  sed 's/{{ \.InviterMessage }}//g' > email-templates/supabase-ready/invite-user.html

echo ""
echo "✅ All templates prepared!"
echo ""
echo "📂 Supabase-ready templates are in: email-templates/supabase-ready/"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Navigate to Authentication → Email Templates"
echo "3. Copy and paste each template from the supabase-ready folder"
echo "4. Click Save for each template"
echo ""
echo "Files created:"
echo "  - email-templates/supabase-ready/email-confirmation.html"
echo "  - email-templates/supabase-ready/password-reset.html"
echo "  - email-templates/supabase-ready/magic-link.html"
echo "  - email-templates/supabase-ready/invite-user.html"
echo ""
