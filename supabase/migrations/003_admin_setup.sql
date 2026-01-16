-- Migration 003: Admin User Setup and Enhanced RLS Policies
-- This migration improves Row Level Security for multi-tenant access control

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can read clients" ON clients;
DROP POLICY IF EXISTS "Admins can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can read responses" ON responses;
DROP POLICY IF EXISTS "Admins can read reports" ON reports;
DROP POLICY IF EXISTS "Admins can insert reports" ON reports;

-- Enhanced RLS Policies for Clients Table
-- Admins can see all clients, consultants only see their assigned clients
CREATE POLICY "Admins can manage all clients" ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Consultants can view assigned clients" ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND clients.id = ANY(admin_users.client_access)
    )
  );

CREATE POLICY "Consultants can update assigned clients" ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND clients.id = ANY(admin_users.client_access)
    )
  );

-- Enhanced RLS Policies for Responses Table
CREATE POLICY "Admins can view all responses" ON responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Consultants can view responses for assigned clients" ON responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND responses.client_id = ANY(admin_users.client_access)
    )
  );

-- Enhanced RLS Policies for Reports Table
CREATE POLICY "Admins can manage all reports" ON reports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'admin'
    )
  );

CREATE POLICY "Consultants can view reports for assigned clients" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND reports.client_id = ANY(admin_users.client_access)
    )
  );

CREATE POLICY "Consultants can create reports for assigned clients" ON reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'consultant'
      AND reports.client_id = ANY(admin_users.client_access)
    )
  );

-- Admin Users RLS Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON admin_users
  FOR SELECT
  USING (admin_users.id = auth.uid());

CREATE POLICY "Users can update their own profile" ON admin_users
  FOR UPDATE
  USING (admin_users.id = auth.uid());

-- Chat Sessions RLS
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT
  USING (chat_sessions.user_id = auth.uid());

CREATE POLICY "Users can create chat sessions" ON chat_sessions
  FOR INSERT
  WITH CHECK (chat_sessions.user_id = auth.uid());

-- Chat Messages RLS
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Function to automatically create admin_users entry after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, role)
  VALUES (NEW.id, NEW.email, 'consultant');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create admin_users entry automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
