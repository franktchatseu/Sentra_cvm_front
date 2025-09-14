export interface CoreModule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: 'business' | 'execution';
}

export interface CoreModuleCategory {
  id: string;
  title: string;
  modules: CoreModule[];
}
