/**
 * テストユーザーをローカルDBに作成するシードスクリプト
 * Usage: node api/scripts/seed-test-user.mjs
 *
 * ローカル開発サーバー (localhost:8787) が起動している必要があります。
 * npm run dev:api で起動してから実行してください。
 */

const API_URL = "http://localhost:8788";

const TEST_USER = {
  email: "test@example.com",
  password: "test1234",
  name: "テストユーザー",
};

async function seedTestUser() {
  console.log(`テストユーザーを作成: ${TEST_USER.email}`);

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(TEST_USER),
  });

  const body = await res.json();

  if (res.status === 201) {
    console.log("✅ 作成成功");
    console.log(`   email   : ${TEST_USER.email}`);
    console.log(`   password: ${TEST_USER.password}`);
    console.log(`   userId  : ${body.user.id}`);
    return;
  }

  if (res.status === 409) {
    console.log("ℹ️  既に存在します（スキップ）");
    console.log(`   email   : ${TEST_USER.email}`);
    console.log(`   password: ${TEST_USER.password}`);
    return;
  }

  console.error("❌ 失敗:", body);
  process.exit(1);
}

seedTestUser().catch((err) => {
  console.error("❌ 接続エラー:", err.message);
  console.error("   ローカルAPIサーバーが起動しているか確認してください (npm run dev:api)");
  process.exit(1);
});
