-- ============================================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR AI-POWERED INVOICE TRACKING SYSTEM
-- Supports: AI Processing, Fraud Detection, Analytics, Workflow Automation
-- ============================================================================

CREATE DATABASE IF NOT EXISTS invoice_tracking_system
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE invoice_tracking_system;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Services table
CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(100),
    can_create_invoices BOOLEAN DEFAULT TRUE,
    can_approve_invoices BOOLEAN DEFAULT FALSE,
    approval_threshold DECIMAL(15,2),
    requires_manager_approval BOOLEAN DEFAULT TRUE,
    default_currency VARCHAR(3) DEFAULT 'EUR',
    payment_terms INT DEFAULT 30,
    cost_center VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36)
);

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    service_id VARCHAR(50) NOT NULL,
    role ENUM('admin', 'manager', 'employee', 'viewer', 'approver', 'finance') NOT NULL,
    manager_id VARCHAR(36),
    location VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    require_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    notes TEXT,
    
    INDEX idx_email (email),
    INDEX idx_service (service_id),
    INDEX idx_role (role),
    INDEX idx_manager (manager_id),
    INDEX idx_is_active (is_active),
    
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- User permissions table
CREATE TABLE user_permissions (
    user_id VARCHAR(36) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(36) NOT NULL,
    
    PRIMARY KEY (user_id, permission),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Vendors table
CREATE TABLE vendors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(100),
    registration_number VARCHAR(100),
    vat_number VARCHAR(100),
    default_currency VARCHAR(3) DEFAULT 'EUR',
    payment_terms INT DEFAULT 30,
    bank_account TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_country (country),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Invoices table
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    number VARCHAR(100) UNIQUE NOT NULL,
    vendor_id VARCHAR(36) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255),
    vendor_phone VARCHAR(50),
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    exchange_rate DECIMAL(10,6),
    base_currency_amount DECIMAL(15,2),
    description TEXT NOT NULL,
    notes TEXT,
    external_reference VARCHAR(255),
    invoice_date DATE NOT NULL,
    received_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('draft', 'pending_review', 'pending_approval', 'approved', 'rejected', 'transferred', 'paid', 'cancelled', 'archived') NOT NULL DEFAULT 'draft',
    current_service_id VARCHAR(50) NOT NULL,
    assigned_to VARCHAR(36),
    priority ENUM('low', 'medium', 'high', 'urgent', 'critical') DEFAULT 'medium',
    approval_level INT DEFAULT 1,
    approved_by VARCHAR(36),
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    payment_terms INT NOT NULL DEFAULT 30,
    late_fees DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    discount_due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    updated_by VARCHAR(36) NOT NULL,
    version INT DEFAULT 1,
    
    INDEX idx_number (number),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status),
    INDEX idx_current_service (current_service_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_due_date (due_date),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority),
    INDEX idx_total_amount (total_amount),
    
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
    FOREIGN KEY (current_service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Invoice line items table
CREATE TABLE invoice_line_items (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(15,2),
    cost_center VARCHAR(50),
    gl_account VARCHAR(50),
    category VARCHAR(100),
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_cost_center (cost_center),
    INDEX idx_category (category),
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Invoice history table
CREATE TABLE invoice_history (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    action TEXT NOT NULL,
    action_type ENUM('status_change', 'service_transfer', 'assignment_change', 'approval', 'rejection', 'comment_added', 'file_attached', 'amount_modified', 'due_date_changed', 'priority_changed', 'bulk_operation', 'system_action') NOT NULL,
    from_status ENUM('draft', 'pending_review', 'pending_approval', 'approved', 'rejected', 'transferred', 'paid', 'cancelled', 'archived'),
    to_status ENUM('draft', 'pending_review', 'pending_approval', 'approved', 'rejected', 'transferred', 'paid', 'cancelled', 'archived'),
    from_service_id VARCHAR(50),
    to_service_id VARCHAR(50),
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    comment TEXT,
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_from_status (from_status),
    INDEX idx_to_status (to_status),
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (from_service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (to_service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ============================================================================
-- AI & ANALYTICS TABLES
-- ============================================================================

-- AI Document Processing table
CREATE TABLE ai_document_processing (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    processing_status ENUM('pending', 'processing', 'completed', 'failed', 'retry') DEFAULT 'pending',
    ocr_text LONGTEXT,
    extracted_data JSON,
    confidence_score DECIMAL(5,4),
    processing_time_ms INT,
    ai_model_version VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_by VARCHAR(36),
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_processing_status (processing_status),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence_score (confidence_score),
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- AI Fraud Detection table
CREATE TABLE ai_fraud_detection (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    risk_score DECIMAL(5,4) NOT NULL,
    risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    fraud_indicators JSON,
    anomaly_flags JSON,
    vendor_risk_factors JSON,
    amount_anomalies JSON,
    pattern_analysis JSON,
    ml_model_version VARCHAR(50),
    detection_rules_applied JSON,
    false_positive BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_risk_score (risk_score),
    INDEX idx_created_at (created_at),
    INDEX idx_false_positive (false_positive),
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- AI Categorization Engine table
CREATE TABLE ai_categorization (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    suggested_category VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    suggested_gl_account VARCHAR(50),
    suggested_cost_center VARCHAR(50),
    category_reasoning TEXT,
    alternative_categories JSON,
    user_accepted BOOLEAN DEFAULT FALSE,
    user_override_category VARCHAR(100),
    user_override_reason TEXT,
    ml_model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(36),
    
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_suggested_category (suggested_category),
    INDEX idx_confidence_score (confidence_score),
    INDEX idx_user_accepted (user_accepted),
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- AI Report Insights table
CREATE TABLE ai_report_insights (
    id VARCHAR(36) PRIMARY KEY,
    insight_type ENUM('warning', 'opportunity', 'info') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    value_metric VARCHAR(100) NOT NULL,
    change_percentage DECIMAL(7,4),
    period_analyzed VARCHAR(50) NOT NULL,
    impact_level ENUM('high', 'medium', 'low') NOT NULL,
    trend ENUM('up', 'down', 'stable') NOT NULL,
    recommendations JSON NOT NULL,
    chart_data JSON,
    data_sources JSON,
    generated_by_model VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    generated_by VARCHAR(36),
    
    INDEX idx_insight_type (insight_type),
    INDEX idx_impact_level (impact_level),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- AI Assistant Conversations table
CREATE TABLE ai_assistant_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    conversation_title VARCHAR(255),
    messages JSON NOT NULL,
    context_data JSON,
    total_messages INT DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_started_at (started_at),
    INDEX idx_is_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- WORKFLOW & NOTIFICATIONS TABLES
-- ============================================================================

-- Workflow Rules table
CREATE TABLE workflow_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSON NOT NULL,
    actions JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,
    
    INDEX idx_is_active (is_active),
    INDEX idx_priority (priority),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('info', 'warning', 'error', 'success', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type ENUM('invoice', 'vendor', 'user', 'system') NOT NULL,
    related_entity_id VARCHAR(36),
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ANALYTICS & REPORTING TABLES
-- ============================================================================

-- Analytics Dashboard Metrics table
CREATE TABLE analytics_metrics (
    id VARCHAR(36) PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type ENUM('count', 'sum', 'average', 'percentage', 'ratio') NOT NULL,
    dimension_filters JSON,
    time_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_name (metric_name),
    INDEX idx_time_period (time_period),
    INDEX idx_period_start (period_start),
    INDEX idx_calculated_at (calculated_at),
    
    UNIQUE KEY uk_metric_period (metric_name, time_period, period_start, period_end)
);

-- Export History table
CREATE TABLE export_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    export_type ENUM('pdf', 'excel', 'csv', 'json') NOT NULL,
    entity_type ENUM('invoices', 'vendors', 'reports', 'analytics') NOT NULL,
    filters_applied JSON,
    file_path TEXT,
    file_size BIGINT,
    record_count INT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    downloaded_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_export_type (export_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default services
INSERT INTO services (id, name, code, description, color, icon, can_create_invoices, can_approve_invoices, approval_threshold, requires_manager_approval, default_currency, payment_terms, cost_center, created_by) VALUES
('accounting', 'Comptabilité', 'ACC', 'Service de comptabilité et finances', '#3b82f6', 'calculator', true, true, 5000.00, false, 'EUR', 30, 'CC001', NULL),
('purchasing', 'Achats', 'PUR', 'Service des achats et approvisionnements', '#10b981', 'shopping-cart', true, false, 1000.00, true, 'EUR', 30, 'CC002', NULL),
('finance', 'Finance', 'FIN', 'Service financier et trésorerie', '#f59e0b', 'trending-up', true, true, 10000.00, false, 'EUR', 30, 'CC003', NULL),
('management', 'Direction', 'DIR', 'Direction générale', '#8b5cf6', 'users', false, true, 50000.00, false, 'EUR', 30, 'CC004', NULL),
('hr', 'Ressources Humaines', 'HR', 'Service des ressources humaines', '#ec4899', 'user-check', false, false, 0.00, true, 'EUR', 30, 'CC005', NULL);

-- Insert default permissions
INSERT INTO user_permissions (user_id, permission, granted_by) VALUES
-- Admin permissions will be inserted when admin user is created
('admin-user-id', 'create_invoice', 'system'),
('admin-user-id', 'edit_invoice', 'system'),
('admin-user-id', 'delete_invoice', 'system'),
('admin-user-id', 'view_all_invoices', 'system'),
('admin-user-id', 'manage_users', 'system'),
('admin-user-id', 'view_reports', 'system'),
('admin-user-id', 'view_analytics', 'system'),
('admin-user-id', 'export_data', 'system');

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX idx_invoices_status_service ON invoices(status, current_service_id);
CREATE INDEX idx_invoices_due_date_status ON invoices(due_date, status);
CREATE INDEX idx_invoices_assigned_status ON invoices(assigned_to, status);
CREATE INDEX idx_invoices_total_amount_date ON invoices(total_amount, invoice_date);
CREATE INDEX idx_vendors_rating_active ON vendors(rating, is_active);
CREATE INDEX idx_ai_fraud_risk_level_score ON ai_fraud_detection(risk_level, risk_score);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_analytics_metrics_composite ON analytics_metrics(metric_name, time_period, period_start);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Invoice Summary View
CREATE VIEW invoice_summary AS
SELECT 
    i.id,
    i.number,
    i.vendor_name,
    i.total_amount,
    i.currency,
    i.status,
    i.due_date,
    i.invoice_date,
    s.name as service_name,
    s.color as service_color,
    u.name as assigned_to_name,
    DATEDIFF(CURDATE(), i.due_date) as days_overdue,
    CASE 
        WHEN i.status = 'paid' THEN 'paid'
        WHEN DATEDIFF(CURDATE(), i.due_date) > 0 THEN 'overdue'
        WHEN DATEDIFF(CURDATE(), i.due_date) BETWEEN -7 AND 0 THEN 'due_soon'
        ELSE 'normal'
    END as payment_status
FROM invoices i
LEFT JOIN services s ON i.current_service_id = s.id
LEFT JOIN users u ON i.assigned_to = u.id;

-- AI Insights Summary View
CREATE VIEW ai_insights_summary AS
SELECT 
    i.id as invoice_id,
    i.number as invoice_number,
    dp.confidence_score as ocr_confidence,
    fd.risk_level as fraud_risk,
    fd.risk_score as fraud_score,
    cat.suggested_category,
    cat.confidence_score as category_confidence,
    cat.user_accepted as category_accepted
FROM invoices i
LEFT JOIN ai_document_processing dp ON i.id = dp.invoice_id
LEFT JOIN ai_fraud_detection fd ON i.id = fd.invoice_id
LEFT JOIN ai_categorization cat ON i.id = cat.invoice_id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure to calculate vendor performance metrics
CREATE PROCEDURE CalculateVendorMetrics(IN vendor_id VARCHAR(36))
BEGIN
    DECLARE avg_processing_time DECIMAL(10,2);
    DECLARE total_invoices INT;
    DECLARE overdue_invoices INT;
    DECLARE total_amount DECIMAL(15,2);
    
    SELECT 
        AVG(DATEDIFF(payment_date, invoice_date)) as avg_time,
        COUNT(*) as total_count,
        SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) > 0 AND status != 'paid' THEN 1 ELSE 0 END) as overdue_count,
        SUM(total_amount) as total_amt
    INTO avg_processing_time, total_invoices, overdue_invoices, total_amount
    FROM invoices 
    WHERE vendor_id = vendor_id
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH);
    
    SELECT 
        vendor_id,
        avg_processing_time,
        total_invoices,
        overdue_invoices,
        total_amount,
        CASE 
            WHEN overdue_invoices = 0 THEN 5.0
            WHEN (overdue_invoices / total_invoices) < 0.1 THEN 4.0
            WHEN (overdue_invoices / total_invoices) < 0.2 THEN 3.0
            WHEN (overdue_invoices / total_invoices) < 0.3 THEN 2.0
            ELSE 1.0
        END as calculated_rating;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger to log invoice status changes
CREATE TRIGGER invoice_status_change_log
AFTER UPDATE ON invoices
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO invoice_history (
            id, invoice_id, action, action_type, from_status, to_status,
            user_id, user_name, user_email, timestamp
        ) VALUES (
            UUID(), NEW.id, 
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
            'status_change', OLD.status, NEW.status,
            NEW.updated_by, 
            (SELECT name FROM users WHERE id = NEW.updated_by),
            (SELECT email FROM users WHERE id = NEW.updated_by),
            NOW()
        );
    END IF;
END //

-- Trigger to create notification for high-risk fraud detection
CREATE TRIGGER fraud_detection_notification
AFTER INSERT ON ai_fraud_detection
FOR EACH ROW
BEGIN
    IF NEW.risk_level IN ('high', 'critical') THEN
        INSERT INTO notifications (
            id, user_id, type, title, message, related_entity_type, 
            related_entity_id, priority, created_at
        )
        SELECT 
            UUID(), u.id, 'warning',
            CONCAT('High Risk Invoice Detected: ', i.number),
            CONCAT('Invoice ', i.number, ' from ', i.vendor_name, ' has been flagged with ', NEW.risk_level, ' fraud risk'),
            'invoice', NEW.invoice_id, 'high', NOW()
        FROM invoices i, users u
        WHERE i.id = NEW.invoice_id 
        AND u.role IN ('admin', 'manager', 'finance')
        AND u.is_active = TRUE;
    END IF;
END //

DELIMITER ;