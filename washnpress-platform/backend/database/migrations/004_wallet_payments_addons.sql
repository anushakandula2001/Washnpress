BEGIN;

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL UNIQUE REFERENCES residents(id) ON DELETE CASCADE,
  balance_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (balance_inr >= 0)
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  description VARCHAR(200) NOT NULL,
  amount_inr NUMERIC(12,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (type IN ('credit', 'debit')),
  CHECK (amount_inr > 0)
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  brand VARCHAR(30) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  expiry_month SMALLINT NOT NULL,
  expiry_year SMALLINT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expiry_month BETWEEN 1 AND 12),
  CHECK (expiry_year >= 2024)
);

CREATE TABLE billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_code VARCHAR(30) NOT NULL UNIQUE,
  billing_month VARCHAR(20) NOT NULL,
  billed_on DATE NOT NULL,
  amount_inr NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'paid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('paid', 'pending', 'failed')),
  CHECK (amount_inr >= 0)
);

CREATE TABLE addon_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_inr NUMERIC(12,2) NOT NULL,
  icon VARCHAR(30) NOT NULL DEFAULT 'sparkles',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (price_inr >= 0)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_transactions_wallet_time ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_payment_methods_resident ON payment_methods(resident_id);
CREATE INDEX idx_billing_invoices_resident ON billing_invoices(resident_id, billed_on DESC);
CREATE INDEX idx_notifications_resident_read ON notifications(resident_id, is_read, created_at DESC);

COMMIT;
