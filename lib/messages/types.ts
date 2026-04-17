export type Messages = {
  site: {
    tagline: string;
    homeTitle: string;
    homeDescription: string;
    searchPlaceholder: string;
    toolsNav: string;
    backToHome: string;
    emptyMostUsedLoading: string;
    emptyMostUsedNoRecords: string;
    emptyCategory: string;
    searchModalPlaceholder: string;
    searchModalStartTyping: string;
    /** Use `{query}` as placeholder for the user’s search string. */
    searchModalNoResults: string;
    searchModalFooter: string;
    searchModalSuggestTitle: string;
    searchModalSuggestDescription: string;
    searchModalSuggestEmailLabel: string;
    toolFeedbackHeading: string;
    toolFeedbackBody: string;
    toolFeedbackGitHub: string;
    toolFeedbackEmail: string;
  };
  filters: {
    "Most used": string;
    Development: string;
    Web3: string;
    Design: string;
    Productivity: string;
    Communication: string;
  };
  categories: {
    Development: string;
    Web3: string;
    Design: string;
    Productivity: string;
    Communication: string;
  };
  tools: Record<
    string,
    {
      title: string;
      description: string;
      metaDescription: string;
    }
  >;
};
