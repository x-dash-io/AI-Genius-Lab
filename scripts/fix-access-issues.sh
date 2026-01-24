#!/bin/bash

# Batch fix script for common access issues
# This script identifies and fixes common content access problems

set -e

DATABASE_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/synapze}"

echo "🔧 Content Access Batch Fix Tool"
echo "=================================="
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo -e "${RED}❌ psql not found. Please install PostgreSQL client tools.${NC}"
  exit 1
fi

# Test database connection
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Cannot connect to database.${NC}"
  echo "   DATABASE_URL: $DATABASE_URL"
  exit 1
fi

echo -e "${GREEN}✅ Database connected${NC}"
echo ""

# Function to run SQL query
run_sql() {
  psql "$DATABASE_URL" -t -c "$1"
}

# 1. Fix orphaned purchases (paid but no enrollment)
echo "1️⃣  Finding orphaned purchases (paid but no enrollment)..."
ORPHANED=$(run_sql "SELECT COUNT(*) FROM \"Purchase\" p LEFT JOIN \"Enrollment\" e ON p.id = e.\"purchaseId\" WHERE p.status = 'paid' AND e.id IS NULL;")

if [ "$ORPHANED" -gt 0 ]; then
  echo -e "${YELLOW}   Found $ORPHANED orphaned purchases${NC}"
  
  read -p "   Create enrollments for these purchases? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_sql "
      INSERT INTO \"Enrollment\" (id, \"userId\", \"courseId\", \"purchaseId\", \"grantedAt\")
      SELECT 
        gen_random_uuid(),
        p.\"userId\",
        p.\"courseId\",
        p.id,
        p.\"createdAt\"
      FROM \"Purchase\" p
      LEFT JOIN \"Enrollment\" e ON p.id = e.\"purchaseId\"
      WHERE p.status = 'paid' AND e.id IS NULL
      ON CONFLICT (\"userId\", \"courseId\") DO UPDATE SET \"purchaseId\" = EXCLUDED.\"purchaseId\";
    "
    echo -e "${GREEN}   ✅ Enrollments created${NC}"
  fi
else
  echo -e "${GREEN}   ✅ No orphaned purchases found${NC}"
fi

echo ""

# 2. Find stale pending purchases
echo "2️⃣  Finding stale pending purchases (older than 1 hour)..."
STALE=$(run_sql "SELECT COUNT(*) FROM \"Purchase\" WHERE status = 'pending' AND \"createdAt\" < NOW() - INTERVAL '1 hour';")

if [ "$STALE" -gt 0 ]; then
  echo -e "${YELLOW}   Found $STALE stale pending purchases${NC}"
  echo "   These may indicate webhook failures. Review before taking action."
  echo ""
  echo "   Affected purchases:"
  run_sql "
    SELECT 
      id,
      \"userId\",
      \"courseId\",
      provider,
      \"createdAt\",
      NOW() - \"createdAt\" as age
    FROM \"Purchase\"
    WHERE status = 'pending'
    AND \"createdAt\" < NOW() - INTERVAL '1 hour'
    ORDER BY \"createdAt\" DESC
    LIMIT 10;
  "
  echo ""
  read -p "   Mark these as paid and create enrollments? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_sql "
      UPDATE \"Purchase\"
      SET status = 'paid'
      WHERE status = 'pending'
      AND \"createdAt\" < NOW() - INTERVAL '1 hour';
    "
    echo -e "${GREEN}   ✅ Purchases marked as paid${NC}"
    
    run_sql "
      INSERT INTO \"Enrollment\" (id, \"userId\", \"courseId\", \"purchaseId\", \"grantedAt\")
      SELECT 
        gen_random_uuid(),
        p.\"userId\",
        p.\"courseId\",
        p.id,
        NOW()
      FROM \"Purchase\" p
      WHERE NOT EXISTS (
        SELECT 1 FROM \"Enrollment\" e WHERE e.\"purchaseId\" = p.id
      )
      AND p.status = 'paid'
      ON CONFLICT (\"userId\", \"courseId\") DO UPDATE SET \"purchaseId\" = EXCLUDED.\"purchaseId\";
    "
    echo -e "${GREEN}   ✅ Enrollments created${NC}"
  fi
else
  echo -e "${GREEN}   ✅ No stale pending purchases found${NC}"
fi

echo ""

# 3. List lessons with no content
echo "3️⃣  Finding lessons with no content URLs..."
NO_CONTENT=$(run_sql "
  SELECT COUNT(DISTINCT l.id)
  FROM \"Lesson\" l
  LEFT JOIN \"LessonContent\" lc ON l.id = lc.\"lessonId\" AND lc.\"contentUrl\" IS NOT NULL
  WHERE lc.id IS NULL;
")

if [ "$NO_CONTENT" -gt 0 ]; then
  echo -e "${YELLOW}   Found $NO_CONTENT lessons with no content${NC}"
  echo ""
  echo "   Sample lessons without content:"
  run_sql "
    SELECT 
      l.id,
      l.title,
      c.slug,
      COUNT(lc.id) as content_items
    FROM \"Lesson\" l
    JOIN \"Section\" s ON l.\"sectionId\" = s.id
    JOIN \"Course\" c ON s.\"courseId\" = c.id
    LEFT JOIN \"LessonContent\" lc ON l.id = lc.\"lessonId\" AND lc.\"contentUrl\" IS NOT NULL
    WHERE lc.id IS NULL
    GROUP BY l.id, l.title, c.slug
    LIMIT 10;
  "
  echo ""
  echo "   💡 Action: Upload content to Cloudinary and link via admin panel"
else
  echo -e "${GREEN}   ✅ All lessons have content${NC}"
fi

echo ""

# 4. Summary statistics
echo "4️⃣  Access Summary Statistics"
echo "   ================================"

TOTAL_PURCHASES=$(run_sql "SELECT COUNT(*) FROM \"Purchase\";")
PAID_PURCHASES=$(run_sql "SELECT COUNT(*) FROM \"Purchase\" WHERE status = 'paid';")
PENDING_PURCHASES=$(run_sql "SELECT COUNT(*) FROM \"Purchase\" WHERE status = 'pending';")
TOTAL_ENROLLMENTS=$(run_sql "SELECT COUNT(*) FROM \"Enrollment\";")

echo "   Total Purchases: $TOTAL_PURCHASES"
echo "   Paid: $PAID_PURCHASES"
echo "   Pending: $PENDING_PURCHASES"
echo "   Total Enrollments: $TOTAL_ENROLLMENTS"

echo ""
echo -e "${GREEN}✅ Batch fix analysis complete${NC}"
echo ""
echo "📊 Key Metrics:"
echo "   - Enrollment Coverage: $(( TOTAL_ENROLLMENTS * 100 / (PAID_PURCHASES + 1) ))% of paid purchases"
echo "   - Pending Rate: $(( PENDING_PURCHASES * 100 / (TOTAL_PURCHASES + 1) ))% of all purchases"
echo ""

# 5. Generate report
echo "5️⃣  Generating detailed report..."

REPORT_FILE="access_report_$(date +%Y%m%d_%H%M%S).txt"

cat > "$REPORT_FILE" << EOF
Content Access Status Report
Generated: $(date)

=== PURCHASE STATISTICS ===
Total Purchases: $TOTAL_PURCHASES
Paid: $PAID_PURCHASES
Pending: $PENDING_PURCHASES
Pending Rate: $(( PENDING_PURCHASES * 100 / (TOTAL_PURCHASES + 1) ))%

=== ENROLLMENT STATISTICS ===
Total Enrollments: $TOTAL_ENROLLMENTS
Orphaned Purchases: $ORPHANED
Stale Pending: $STALE

=== CONTENT STATISTICS ===
Lessons Without Content: $NO_CONTENT

=== ISSUES FOUND ===
EOF

if [ "$ORPHANED" -gt 0 ]; then
  echo "⚠️  $ORPHANED orphaned purchases (paid but no enrollment)" >> "$REPORT_FILE"
fi

if [ "$STALE" -gt 0 ]; then
  echo "⚠️  $STALE stale pending purchases (older than 1 hour)" >> "$REPORT_FILE"
fi

if [ "$NO_CONTENT" -gt 0 ]; then
  echo "⚠️  $NO_CONTENT lessons without content" >> "$REPORT_FILE"
fi

if [ "$ORPHANED" -eq 0 ] && [ "$STALE" -eq 0 ] && [ "$NO_CONTENT" -eq 0 ]; then
  echo "✅ No issues detected" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "=== RECOMMENDATIONS ===" >> "$REPORT_FILE"

if [ "$ORPHANED" -gt 0 ]; then
  echo "1. Run: psql \$DATABASE_URL -c 'INSERT INTO \"Enrollment\" ...'" >> "$REPORT_FILE"
fi

if [ "$STALE" -gt 0 ]; then
  echo "1. Check PayPal webhook configuration" >> "$REPORT_FILE"
  echo "2. Review webhook logs for errors" >> "$REPORT_FILE"
  echo "3. Test webhook endpoint is accessible" >> "$REPORT_FILE"
fi

if [ "$NO_CONTENT" -gt 0 ]; then
  echo "1. Re-upload content to Cloudinary via admin panel" >> "$REPORT_FILE"
  echo "2. Verify public IDs are saved to database" >> "$REPORT_FILE"
fi

echo ""
echo "📄 Report saved to: $REPORT_FILE"
cat "$REPORT_FILE"

echo ""
echo -e "${GREEN}✨ Done!${NC}"
