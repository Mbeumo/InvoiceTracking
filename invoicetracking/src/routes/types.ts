export interface RouteConfig {
  path: string;
  element: string;
  public: boolean;
  title?: string;
  permissions?: string[];
  redirectTo?: string;
  meta?: {
    description?: string;
    keywords?: string[];
  };
}

export interface RoutePermission {
  permission: string;
  required: boolean;
}
