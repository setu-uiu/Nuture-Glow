-- Create OAuth tokens table for external calendar integrations
CREATE TABLE IF NOT EXISTS user_oauth_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  access_token LONGTEXT NOT NULL,
  refresh_token LONGTEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_provider (user_id, provider),
  INDEX idx_provider (provider)
);
