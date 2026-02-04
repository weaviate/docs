/**
 * Analytics tracking utility for Google Analytics 4 (GA4)
 * Supports both gtag (GA4) and dataLayer (GTM)
 */

const trackEvent = (eventName, parameters = {}) => {
  // Support gtag (GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }

  // Support dataLayer (GTM)
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...parameters });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 [Analytics]', eventName, parameters);
  }
};

export const analytics = {
  contextualMenu: {
    copyPage: (pageUrl, pageTitle) => {
      trackEvent('contextual_menu_copy_page', {
        event_category: 'engagement',
        event_label: 'page_markdown',
        page_url: pageUrl,
        page_title: pageTitle,
      });
    },

    copyPrompt: (page, language, promptName) => {
      trackEvent('contextual_menu_copy_prompt', {
        event_category: 'engagement',
        event_label: 'prompt_copied',
        page,
        language,
        prompt_name: promptName,
      });
    },

    selectLanguage: (fromLanguage, toLanguage, page) => {
      trackEvent('contextual_menu_language_select', {
        event_category: 'engagement',
        event_label: 'language_changed',
        from_language: fromLanguage,
        to_language: toLanguage,
        page,
      });
    },

    openLLM: (llmPlatform, variant, additionalParams = {}) => {
      trackEvent('contextual_menu_open_llm', {
        event_category: 'engagement',
        event_label: `open_${llmPlatform}`,
        llm_platform: llmPlatform,
        variant,
        ...additionalParams,
      });
    },

    connectMCP: (mcpType) => {
      trackEvent('contextual_menu_connect_mcp', {
        event_category: 'engagement',
        event_label: `connect_${mcpType}`,
        mcp_type: mcpType,
      });
    },

    viewMarkdown: (variant, additionalParams = {}) => {
      trackEvent('contextual_menu_view_markdown', {
        event_category: 'engagement',
        event_label: 'view_markdown',
        variant,
        ...additionalParams,
      });
    },

    toggleDropdown: (isOpen, variant) => {
      trackEvent('contextual_menu_dropdown_toggle', {
        event_category: 'engagement',
        event_label: isOpen ? 'dropdown_opened' : 'dropdown_closed',
        variant,
      });
    },
  },

  promptStarter: {
    view: (page, languages, promptDetailsKey) => {
      trackEvent('prompt_starter_view', {
        event_category: 'engagement',
        event_label: 'banner_displayed',
        page,
        languages_available: languages.join(','),
        prompt_details_key: promptDetailsKey,
      });
    },

    toggleDetails: (isExpanded, page, promptDetailsKey) => {
      trackEvent(isExpanded ? 'prompt_starter_expand' : 'prompt_starter_collapse', {
        event_category: 'engagement',
        event_label: isExpanded ? 'details_expanded' : 'details_collapsed',
        page,
        prompt_details_key: promptDetailsKey,
      });
    },
  },
};

export default analytics;
