// Schema contract for 202610060001_foundation.sql. Regenerate after schema changes.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type CompanyRole = "owner" | "admin" | "accountant" | "viewer";
type BusinessType = "products" | "services" | "both";
type Timestamps = { created_at: string; updated_at: string };
type Company = Timestamps & {
  id: string;
  name: string;
  country_code: string;
  base_currency: string;
  timezone: string;
  industry: string;
  business_type: BusinessType;
  has_locations: boolean;
  created_by: string;
};
type Profile = Timestamps & {
  id: string;
  email: string;
  display_name: string | null;
};
type Membership = Timestamps & {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
};
type Preferences = Timestamps & {
  company_id: string;
  analysis_interests: string[];
  onboarding_completed_at: string;
};
type Location = Timestamps & {
  id: string;
  company_id: string;
  name: string;
  created_by: string;
  archived_at: string | null;
};
type Audit = {
  id: string;
  company_id: string;
  user_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  previous_values: Json | null;
  new_values: Json | null;
  created_at: string;
};
type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      companies: Table<Company>;
      company_memberships: Table<Membership>;
      company_preferences: Table<Preferences>;
      locations: Table<
        Location,
        Pick<Location, "company_id" | "name" | "created_by"> & Partial<Location>
      >;
      audit_events: Table<Audit>;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_company: {
        Args: {
          company_name: string;
          country: string;
          currency: string;
          company_timezone: string;
          company_industry: string;
          kind: BusinessType;
          multiple_locations: boolean;
          location_names?: string[];
          interests?: string[];
        };
        Returns: string;
      };
    };
    Enums: { company_role: CompanyRole; business_type: BusinessType };
    CompositeTypes: { [_ in never]: never };
  };
};
