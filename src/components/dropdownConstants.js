// src/components/dropdownConstants.js

export const productDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Overview</li>
    <li><a class="dropdown__link" href="https://weaviate.io/platform">Vector Database</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/workbench">Workbench</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/product/integrations">Integrations</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Deployment</li>
    <li><a class="dropdown__link" href="https://weaviate.io/deployment/serverless">Serverless Cloud</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/deployment/enterprise-cloud">Enterprise Cloud</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/deployment/byoc">Bring Your Own Cloud</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/deployment/enablement">Enablement</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Overview</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/platform">Vector Database</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/workbench">Workbench</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/product/integrations">Integrations</a></li>
  <li class="dropDownLabel mobDrop">Deployment</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/deployment/serverless">Serverless Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/deployment/enterprise-cloud">Enterprise Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/deployment/byoc">Bring Your Own Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/deployment/enablement">Enablement</a></li>
</ul>
`;

export const solutionsDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Use Cases</li>
    <li><a class="dropdown__link" href="https://weaviate.io/rag">RAG</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/hybrid-search">Hybrid Search</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/gen-feedback-loops">Generative Feedback Loops</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/cost-performance-optimization">Cost-Performance Optimization</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Examples</li>
    <li><a class="dropdown__link" href="https://weaviate.io/case-studies">Case Studies</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/community/demos">Demos</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Use Cases</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/rag">RAG</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/hybrid-search">Hybrid Search</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/gen-feedback-loops">Generative Feedback Loops</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/deployment/enterprise-cloud">Infrastructure Optimization</a></li>
  <li class="dropDownLabel mobDrop">Examples</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/case-studies">Case Studies</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/community/demos">Demos</a></li>
</ul>
`;

export const developersDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Engage</li>
    <li><a class="dropdown__link" href="https://weaviate.io/community/events">Events & Webinars</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/community">Weaviate Hero Program</a></li>
    <li><a class="dropdown__link" href="https://forum.weaviate.io/">Forum</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/slack">Slack</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Learn</li>
    <li><a class="dropdown__link" href="https://weaviate.io/learn">Learning Center</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/blog">Blog</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/academy">Academy</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/community/events">Workshops</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/community/build-with-weaviate">Showcases</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/learn/knowledgecards">Knowledge Cards</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/javascript">JavaScript</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/papers">Paper Reviews</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/podcast">Podcasts</a></li>
  </ul>
  <div class="divider"></div>
    <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Documentation</li>
    <li><a class="dropdown__link dropdown__link--highlight" href="/docs/weaviate">Weaviate Docs</a></li>
    <li><a class="dropdown__link dropdown__link--highlight" href="/docs/cloud">Weaviate Cloud Docs</a></li>
    <li><a class="dropdown__link dropdown__link--highlight" href="/docs/cloud">Weaviate Agent Docs</a></li>
    <li><a class="dropdown__link" href="/docs/integrations">Integrations Docs</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Build</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/weaviate">Documentation</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/cloud">Weaviate Cloud Docs</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/developers/integrations">Integrations Docs</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://github.com/weaviate/weaviate">GitHub</a></li>
  <li class="dropDownLabel mobDrop">Learn</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/learn">Learning Center</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/blog">Blog</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/academy">Academy</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/community/events">Workshops</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/community/build-with-weaviate">Showcases</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/learn/knowledgecards">Knowledge Cards</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/papers">Paper Reviews</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/podcast">Podcasts</a></li>
  <li class="dropDownLabel mobDrop">Engage</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/community/events">Events & Webinars</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/community">Weaviate Hero Program</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://forum.weaviate.io/">Forum</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/slack">Slack</a></li>
</ul>
`;

export const companyDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Partners</li>
    <li><a class="dropdown__link" href="https://weaviate.io/partners">Overview</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/partners/aws">AWS</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/partners/gcp">Google</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/partners/snowflake">Snowflake</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">About</li>
    <li><a class="dropdown__link" href="https://weaviate.io/company/about-us">Company</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/company/careers">Careers</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/company/remote">Remote</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/company/playbook">Playbook</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/company/investors">Investors</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/contact">Contact Us</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">About</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/company/about-us">Company</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/company/careers">Careers</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/company/remote">Remote</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/company/playbook">Playbook</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/company/investors">Investors</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/contact">Contact Us</a></li>
  <li class="dropDownLabel mobDrop">Partners</li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/partners">Overview</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/partners/aws">AWS</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/partners/gcp">Google</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/partners/snowflake">Snowflake</a></li>
</ul>
`;
