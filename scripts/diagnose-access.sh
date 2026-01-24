#!/bin/bash

# Troubleshooting script for buyer content access issues
# Usage: ./diagnose-access.sh <USER_ID> <COURSE_ID>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <USER_ID> <COURSE_ID>"
  echo ""
  echo "Example: $0 clh1234567 clh7654321"
  exit 1
fi

USER_ID="$1"
COURSE_ID="$2"
API_URL="${API_URL:-http://localhost:3000}"

echo "🔍 Diagnosing access for User: $USER_ID, Course: $COURSE_ID"
echo "📡 API Base URL: $API_URL"
echo ""

# Check if endpoints are available
echo "1️⃣  Testing connection to API..."
if ! curl -s -f "${API_URL}/api/health" > /dev/null 2>&1; then
  echo "❌ Cannot connect to API at ${API_URL}"
  echo "   Make sure the server is running!"
  exit 1
fi
echo "✅ API is reachable"
echo ""

# Check access status
echo "2️⃣  Checking purchase and enrollment status..."
RESPONSE=$(curl -s -X POST "${API_URL}/api/debug/access-check" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"${USER_ID}\",\"courseId\":\"${COURSE_ID}\"}")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Extract diagnosis
DIAGNOSIS=$(echo "$RESPONSE" | jq -r '.diagnosis' 2>/dev/null)
if [ ! -z "$DIAGNOSIS" ] && [ "$DIAGNOSIS" != "null" ]; then
  echo ""
  echo "📊 Diagnosis:"
  echo "$DIAGNOSIS" | jq '.'
  
  # Interpret results
  HAS_PAID_PURCHASE=$(echo "$DIAGNOSIS" | jq -r '.hasPaidPurchase')
  HAS_ENROLLMENT=$(echo "$DIAGNOSIS" | jq -r '.hasEnrollment')
  HAS_LESSON_CONTENT=$(echo "$DIAGNOSIS" | jq -r '.hasLessonContent')
  
  echo ""
  echo "🔎 Interpretation:"
  
  if [ "$HAS_PAID_PURCHASE" = "true" ]; then
    echo "✅ User has a PAID purchase"
  else
    echo "❌ User does NOT have a paid purchase (purchase missing or status != 'paid')"
    echo "   💡 Action: Check if PayPal webhook is working"
  fi
  
  if [ "$HAS_ENROLLMENT" = "true" ]; then
    echo "✅ Enrollment record exists"
  else
    echo "❌ Enrollment record missing"
    echo "   💡 Action: Check webhook logs for enrollment creation failures"
  fi
  
  if [ "$HAS_LESSON_CONTENT" = "true" ]; then
    echo "✅ Lessons have content URLs"
  else
    echo "❌ No lessons have content URLs"
    echo "   💡 Action: Check if content was uploaded to Cloudinary"
  fi
fi

echo ""
echo "3️⃣  Checking lesson content availability..."
# Get first lesson for the course
FIRST_LESSON=$(curl -s -X POST "${API_URL}/api/debug/content-check" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"${COURSE_ID}\"}" | jq -r '.details[0].lessonId' 2>/dev/null)

if [ ! -z "$FIRST_LESSON" ] && [ "$FIRST_LESSON" != "null" ]; then
  echo "Checking lesson: $FIRST_LESSON"
  CONTENT_RESPONSE=$(curl -s -X POST "${API_URL}/api/debug/content-check" \
    -H "Content-Type: application/json" \
    -d "{\"lessonId\":\"${FIRST_LESSON}\"}")
  
  MISSING=$(echo "$CONTENT_RESPONSE" | jq '.details[0].missingContent | length' 2>/dev/null)
  if [ "$MISSING" -gt 0 ]; then
    echo "⚠️  Found $MISSING missing content items:"
    echo "$CONTENT_RESPONSE" | jq '.details[0].missingContent' 2>/dev/null
    echo ""
    echo "💡 Action: Re-upload content to Cloudinary"
  else
    echo "✅ All content exists in Cloudinary"
  fi
else
  echo "⚠️  No lessons found for this course"
fi

echo ""
echo "4️⃣  Summary & Next Steps:"
echo ""
echo "If user can't access content, check in this order:"
echo "  1. Is purchase.status = 'paid'? ← Most common issue"
echo "     → Check: PayPal webhook configuration & logs"
echo ""
echo "  2. Does enrollment record exist?"
echo "     → Check: Webhook error logs"
echo ""
echo "  3. Do lessons have content URLs?"
echo "     → Check: Content upload to Cloudinary"
echo ""
echo "  4. Do content URLs exist in Cloudinary?"
echo "     → Check: Cloudinary dashboard"
echo ""

echo "📝 Full response saved above. Use 'jq' to parse JSON easily."
echo ""
echo "✨ Troubleshooting complete!"
