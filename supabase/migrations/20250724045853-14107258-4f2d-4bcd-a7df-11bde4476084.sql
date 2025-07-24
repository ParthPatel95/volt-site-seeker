-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create document categories and permissions
CREATE TYPE public.document_category AS ENUM (
    'contract', 'report', 'technical', 'financial', 'legal', 'marketing', 'other'
);

CREATE TYPE public.permission_level AS ENUM ('read', 'write', 'admin');

-- Create comprehensive document folders table
CREATE TABLE public.document_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.document_folders(id),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on document_folders
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- Create documents table for comprehensive document management
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category document_category DEFAULT 'other',
    folder_id UUID REFERENCES public.document_folders(id),
    owner_id UUID NOT NULL,
    description TEXT,
    tags TEXT[],
    version INTEGER DEFAULT 1,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create document permissions table
CREATE TABLE public.document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    permission_level permission_level NOT NULL,
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(document_id, user_id)
);

-- Enable RLS on document_permissions
ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;

-- Create notifications table for comprehensive notification system
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create user preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    notification_settings JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create report templates table
CREATE TABLE public.report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_config JSONB NOT NULL,
    created_by UUID NOT NULL,
    is_public BOOLEAN DEFAULT false,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on report_templates
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Create generated reports table
CREATE TABLE public.generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.report_templates(id),
    generated_by UUID NOT NULL,
    report_data JSONB NOT NULL,
    parameters JSONB,
    file_url TEXT,
    status TEXT DEFAULT 'generating',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on generated_reports
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for document_folders
CREATE POLICY "Users can manage their own folders"
ON public.document_folders
FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Users can view shared folders"
ON public.document_folders
FOR SELECT
USING (
    owner_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.document_permissions dp
        JOIN public.documents d ON d.folder_id = document_folders.id
        WHERE dp.document_id = d.id AND dp.user_id = auth.uid()
    )
);

-- Create RLS policies for documents
CREATE POLICY "Users can manage their own documents"
ON public.documents
FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Users can view documents with permissions"
ON public.documents
FOR SELECT
USING (
    owner_id = auth.uid() OR 
    NOT is_private OR
    EXISTS (
        SELECT 1 FROM public.document_permissions
        WHERE document_id = documents.id AND user_id = auth.uid()
    )
);

-- Create RLS policies for document_permissions
CREATE POLICY "Document owners can manage permissions"
ON public.document_permissions
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.documents
        WHERE documents.id = document_permissions.document_id
        AND documents.owner_id = auth.uid()
    )
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid());

-- Create RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
USING (user_id = auth.uid());

-- Create RLS policies for report_templates
CREATE POLICY "Users can view public templates"
ON public.report_templates
FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their own templates"
ON public.report_templates
FOR ALL
USING (created_by = auth.uid());

-- Create RLS policies for generated_reports
CREATE POLICY "Users can manage their own reports"
ON public.generated_reports
FOR ALL
USING (generated_by = auth.uid());

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE TRIGGER update_document_folders_updated_at
    BEFORE UPDATE ON public.document_folders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at
    BEFORE UPDATE ON public.report_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();