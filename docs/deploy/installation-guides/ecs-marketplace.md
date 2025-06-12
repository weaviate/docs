---
title: Marketplace - EC2
description: Deploy Weaviate using Docker on an EC2 instance.
---

A fully operational instance of Weaviate can now be deployed on an EC2 instance using Docker with the AWS Marketplace. This option is perfect for developers who want to prototype and test Weaviate quickly and easily. It uses a [CloudFormation template](https://aws.amazon.com/cloudformation/) for delivery. 

:::tip Prerequisites

- An AWS account with sufficient credit.
- (Recommended) Familiarity with AWS and the management console.
- Sufficient AWS permissions to deploy an EC2 instance using CloudFormation.
:::

## Installation

:::info Background information 

Weaviate is deployed on a Docker container on a single EC2 instance. This is a monthly contract that is billed immediately through AWS. The current pricing for a one month contract is $149. 

This solution is best for testing and development and **does not include enterprise support**. 
:::

<div style={{position: "relative", paddingBottom: "calc(54.10879629629629% + 50px)", height: 0}}>
  <iframe 
    id="xrgwj91u1p" 
    src="https://app.guideflow.com/embed/xrgwj91u1p" 
    width="100%" 
    height="100%" 
    style={{overflow: "hidden", position: "absolute", border: "none"}} 
    scrolling="no" 
    allow="clipboard-read; clipboard-write" 
    webKitAllowFullScreen 
    mozAllowFullScreen 
    allowFullScreen 
    allowTransparency="true"
  />
  <script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="xrgwj91u1p"></script>
</div>

### Instructions

1. Navigate to Weaviate's [AWS marketplace listing](https://aws.amazon.com/marketplace/pp/prodview-5h4od6j4wtcrw?sr=0-4&ref_=beagle&applicationId=AWSMPContessa).
1. Subscribe to the product by following the instructions on the page. 
1. Click <kbd>"View Purchase Options,"</kbd> then proceed to the next page. 
1. By default, the contract lasts for one month; however, you can choose to "auto-renew" your contract.
1. By default, a m7g.medium EC2 instance is used.
1. Click <kbd>"Create contract"</kbd> and the contract will be created.
1. Click "Continue to configuration" and proceed to the next page.
1. Click "ECS" and then "Quick launch the template" to start the configuration.
1. On this page, create a "stack name," choose an existing VPC, choose a subnet, and add tags (if necessary).
1. Once you have finished configuring your CloudFormation template, click the checkbox to acknowledge.
1. Click "Create stack" and your CloudFormation template will be deployed. 
AWS will inform you when your stack has been created.  

## Deleting the instance

You can delete the cluster by deleting the CloudFormation stack.

### Some resources many require manual deletion

:::caution
Verify that all unused resources are deleted. You continue to incur costs for undeleted resources.
:::

#### Tips

- If your CloudFormation stack indicates "DELETE_FAILED", you may be able to re-initiate deletion of these resources.
- Review the `Resources` tab of the CloudFormation stack to find resources that may not have been deleted.

### Billing

You will be charged for Weaviate and associated resources directly by AWS.

### Other marketplace offerings

- [Weaviate serverless cloud](https://aws.amazon.com/marketplace/pp/prodview-ng2dfhb4yjoic?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)
- [Weaviate enterprise cloud](https://aws.amazon.com/marketplace/pp/prodview-27nbweprm7hha?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)


## Questions and feedback

import DocsFeedback from '/\_includes/docs-feedback.mdx';

<DocsFeedback/>