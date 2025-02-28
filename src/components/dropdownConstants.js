// src/components/dropdownConstants.js

export const productDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Overview</li>
    <li><a class="dropdown__link" href="/platform">Vector Database</a></li>
    <li><a class="dropdown__link" href="/workbench">Workbench</a></li>
    <li><a class="dropdown__link" href="/product/integrations">Integrations</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Deployment</li>
    <li><a class="dropdown__link" href="/deployment/serverless">Serverless Cloud</a></li>
    <li><a class="dropdown__link" href="/deployment/enterprise-cloud">Enterprise Cloud</a></li>
    <li><a class="dropdown__link" href="/deployment/byoc">Bring Your Own Cloud</a></li>
    <li><a class="dropdown__link" href="/deployment/enablement">Enablement</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Overview</li>
  <li class="menu__list-item"><a class="menu__link" href="/platform">Vector Database</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/workbench">Workbench</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/product/integrations">Integrations</a></li>
  <li class="dropDownLabel mobDrop">Deployment</li>
  <li class="menu__list-item"><a class="menu__link" href="/deployment/serverless">Serverless Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/deployment/enterprise-cloud">Enterprise Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/deployment/byoc">Bring Your Own Cloud</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/deployment/enablement">Enablement</a></li>
</ul>
`;

export const solutionsDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Use Cases</li>
    <li><a class="dropdown__link" href="/rag">RAG</a></li>
    <li><a class="dropdown__link" href="/hybrid-search">Hybrid Search</a></li>
    <li><a class="dropdown__link" href="/gen-feedback-loops">Generative Feedback Loops</a></li>
    <li><a class="dropdown__link" href="/cost-performance-optimization">Cost-Performance Optimization</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Examples</li>
    <li><a class="dropdown__link" href="/case-studies">Case Studies</a></li>
    <li><a class="dropdown__link" href="/community/demos">Demos</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Use Cases</li>
  <li class="menu__list-item"><a class="menu__link" href="/rag">RAG</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/hybrid-search">Hybrid Search</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/gen-feedback-loops">Generative Feedback Loops</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/deployment/enterprise-cloud">Infrastructure Optimization</a></li>
  <li class="dropDownLabel mobDrop">Examples</li>
  <li class="menu__list-item"><a class="menu__link" href="/case-studies">Case Studies</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/community/demos">Demos</a></li>
</ul>
`;

export const developersDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Build</li>
    <li><a class="dropdown__link" href="/weaviate">Documentation</a></li>
    <li><a class="dropdown__link" href="/cloud">Weaviate Cloud Docs</a></li>
    <li><a class="dropdown__link" href="/developers/integrations">Integrations Docs</a></li>
    <li><a class="dropdown__link" href="https://github.com/weaviate/weaviate">GitHub</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Learn</li>
    <li><a class="dropdown__link" href="/learn">Learning Center</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/blog">Blog</a></li>
    <li><a class="dropdown__link" href="/academy">Academy</a></li>
    <li><a class="dropdown__link" href="/community/events">Workshops</a></li>
    <li><a class="dropdown__link" href="/community/build-with-weaviate">Showcases</a></li>
    <li><a class="dropdown__link" href="/learn/knowledgecards">Knowledge Cards</a></li>
    <li><a class="dropdown__link" href="/javascript">JavaScript</a></li>
    <li><a class="dropdown__link" href="/papers">Paper Reviews</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/podcast">Podcasts</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Engage</li>
    <li><a class="dropdown__link" href="/community/events">Events & Webinars</a></li>
    <li><a class="dropdown__link" href="/community">Weaviate Hero Program</a></li>
    <li><a class="dropdown__link" href="https://forum.weaviate.io/">Forum</a></li>
    <li><a class="dropdown__link" href="https://weaviate.io/slack">Slack</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">Build</li>
  <li class="menu__list-item"><a class="menu__link" href="/weaviate">Documentation</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/cloud">Weaviate Cloud Docs</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/developers/integrations">Integrations Docs</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://github.com/weaviate/weaviate">GitHub</a></li>
  <li class="dropDownLabel mobDrop">Learn</li>
  <li class="menu__list-item"><a class="menu__link" href="/learn">Learning Center</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/blog">Blog</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/academy">Academy</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/community/events">Workshops</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/community/build-with-weaviate">Showcases</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/learn/knowledgecards">Knowledge Cards</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/papers">Paper Reviews</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/podcast">Podcasts</a></li>
  <li class="dropDownLabel mobDrop">Engage</li>
  <li class="menu__list-item"><a class="menu__link" href="/community/events">Events & Webinars</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/community">Weaviate Hero Program</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://forum.weaviate.io/">Forum</a></li>
  <li class="menu__list-item"><a class="menu__link" href="https://weaviate.io/slack">Slack</a></li>
</ul>
`;

export const companyDropdownHtml = `
<div class="holder">
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">Partners</li>
    <li><a class="dropdown__link" href="/partners">Overview</a></li>
    <li><a class="dropdown__link" href="/partners/aws">AWS</a></li>
    <li><a class="dropdown__link" href="/partners/gcp">Google</a></li>
    <li><a class="dropdown__link" href="/partners/snowflake">Snowflake</a></li>
  </ul>
  <div class="divider"></div>
  <ul class="holdRightnoBorder">
    <li class="dropDownLabel">About</li>
    <li><a class="dropdown__link" href="/company/about-us">Company</a></li>
    <li><a class="dropdown__link" href="/company/careers">Careers</a></li>
    <li><a class="dropdown__link" href="/company/remote">Remote</a></li>
    <li><a class="dropdown__link" href="/company/playbook">Playbook</a></li>
    <li><a class="dropdown__link" href="/company/investors">Investors</a></li>
    <li><a class="dropdown__link" href="/contact">Contact Us</a></li>
  </ul>
</div>
<ul class="menu__list mobileNav">
  <li class="dropDownLabel mobDrop">About</li>
  <li class="menu__list-item"><a class="menu__link" href="/company/about-us">Company</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/company/careers">Careers</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/company/remote">Remote</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/company/playbook">Playbook</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/company/investors">Investors</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/contact">Contact Us</a></li>
  <li class="dropDownLabel mobDrop">Partners</li>
  <li class="menu__list-item"><a class="menu__link" href="/partners">Overview</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/partners/aws">AWS</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/partners/gcp">Google</a></li>
  <li class="menu__list-item"><a class="menu__link" href="/partners/snowflake">Snowflake</a></li>
</ul>
`;
