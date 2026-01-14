#!/bin/bash
set -e

CONTAINER=casino-mis-db-test

echo "Running PostgreSQL container..."
docker compose -f docker-compose.db-test.yaml up -d

echo "Waiting for PostgreSQL..."
sleep 5

for file in ./tests/*.sql; do
  echo "=========================================="
  echo "Run test: $file"

  OUTPUT=$(docker exec -i $CONTAINER psql -U root -d casino_mis_test < "$file" 2>&1)

  echo "$OUTPUT"

  if echo "$OUTPUT" | grep -q "ERROR:"; then
    echo "⚠️ Expected error or constraint violation in $file"
  else
    echo "✅ Test success: $file"
  fi
done

echo "Stopping PostgreSQL..."
docker compose -f docker-compose.db-test.yaml down

echo "=========================================="
echo "All tests completed!"
