export type ExecuteResponse = {
  status: string;
  version?: string;
  module?: string;
  result?: string;
  logs?: string[];
  insights?: string;
  founder?: string;
};

export type IntegrationStatus = {
  key: string;
  configured: boolean;
};
