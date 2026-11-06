# Approved scratch-org templates

Use this reference for quick guidance when a partner's development capability
matches an approved template. Each template is additive: merge its `features`
and `settings` into the canonical baseline. Do not set an edition in a
template; direct the partner to [Supported Scratch Org Editions and
Allocations](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_editions_and_allocations.htm).

## Status and selective use

- **Status:** approved practitioner guidance from the scratch-org interview,
  reviewed 2026-08-28. It is skill guidance, not a UI dependency or a copy of
  UI implementation.
- **Read selectively:** read the canonical baseline and only the heading for
  the partner's selected capability. Do not load unrelated product sections.
- **Recommendation:** use a template only for capabilities the partner is
  actually developing or packaging; do not add unrelated capabilities.
- **Refresh:** read [source-refresh.md](source-refresh.md) before presenting a
  template value as current. If verification is unavailable, label the value
  as **unknown** and do not generate it.

## Canonical baseline

```json
{
  "features": ["EnableSetPasswordInApi"],
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true,
      "enableUsersAreLightningOnly": true,
      "enableLexEndUsersNoSwitching": true
    },
    "mobileSettings": {
      "enableS1EncryptedStoragePref2": false
    }
  }
}
```

## Approved capability additions

### Agentforce

```json
{
  "features": ["Einstein1AIPlatform"],
  "settings": {
    "einsteinGptSettings": {"enableEinsteinGptPlatform": true},
    "agentPlatformSettings": {"enableAgentPlatform": true}
  }
}
```

### Data Cloud

```json
{
  "features": ["CustomerDataPlatform", "CustomerDataPlatformLite", "MarketingUser"],
  "settings": {"customerDataPlatformSettings": {"enableCustomerDataPlatform": true}}
}
```

### CRM Analytics

```json
{
  "features": ["DevelopmentWave", "AnalyticsAdminPerms", "AnalyticsAppEmbedded", "EAOutputConnectors", "EinsteinAnalyticsPlus", "InsightsPlatform"],
  "settings": {"analyticsSettings": {"enableInsights": true}}
}
```

### Tableau Next

```json
{
  "features": ["TableauEinstein", "DevelopmentWave", "CustomerDataPlatform", "CustomerDataPlatformLite", "MarketingUser"],
  "settings": {"customerDataPlatformSettings": {"enableCustomerDataPlatform": true}}
}
```

### Marketing Cloud

```json
{
  "features": ["MarketingCloud", "MarketingUser", "AIAttribution"],
  "settings": {}
}
```

### Order Management

```json
{
  "features": ["OrderManagement"],
  "settings": {
    "orderManagementSettings": {"enableOrderManagement": true},
    "orderSettings": {
      "enableOrders": true,
      "enableNegativeQuantity": true,
      "enableZeroQuantity": true,
      "enableEnhancedCommerceOrders": true,
      "enableOrderEvents": true
    }
  }
}
```

### Field Service

```json
{
  "features": ["FieldService:10", "FieldServiceAppointmentAssistantUser:10", "FieldServiceDispatcherUser:10", "FieldServiceLastMileUser:10", "FieldServiceMobileExtension", "FieldServiceMobileUser:10", "FieldServiceSchedulingUser:10", "MobileExtMaxFileSizeMB:1000"],
  "settings": {
    "fieldServiceSettings": {
      "enableWorkOrders": true,
      "enableWorkPlansAutoGeneration": true,
      "isLocationHistoryEnabled": true
    }
  }
}
```

### DevOps Center

```json
{
  "features": ["DevOpsCenter"],
  "settings": {"devHubSettings": {"enableDevOpsCenterGA": true}}
}
```

### Revenue Cloud

```json
{
  "features": ["BillingAdvanced", "InvoiceManagement", "CoreCpq"],
  "settings": {"revenueManagementSettings": {"enableCoreCPQ": true}}
}
```

### Financial Services Cloud

```json
{
  "features": ["FinancialServicesCommunityUser:5", "FinancialServicesInsuranceUser", "FinancialServicesUser:5", "FSCAlertFramework", "FSCServiceProcess", "IndustriesBranchManagement", "PersonAccounts", "ContactsToMultipleAccounts", "AssociationEngine"],
  "settings": {}
}
```

### Health Cloud

```json
{
  "features": ["HealthCloudAddOn", "HealthCloudForCmty", "HealthCloudMedicationReconciliation", "HealthCloudPNMAddOn", "HealthCloudUser", "HLSAnalytics", "PersonAccounts", "ContactsToMultipleAccounts"],
  "settings": {}
}
```

### Consumer Goods Cloud

```json
{
  "features": ["EinsteinVisits", "CGAnalytics"],
  "settings": {}
}
```

### Education Cloud

```json
{
  "features": ["EducationCloud:3"],
  "settings": {}
}
```

### Energy and Utilities Cloud

```json
{
  "features": ["EnergyAndUtilitiesCloud", "EAndUDigitalSales"],
  "settings": {}
}
```

### Net Zero Cloud

```json
{
  "features": ["SustainabilityApp", "SustainabilityCloud", "TCRMforSustainability", "DisclosureFramework"],
  "settings": {}
}
```

### Public Sector Cloud

```json
{
  "features": ["PublicSectorAccess", "PublicSectorApplicationUsageCreditsAddOn", "PublicSectorSiteTemplate"],
  "settings": {}
}
```

### B2B Commerce

```json
{
  "features": ["B2BCommerce", "B2BLoyaltyManagement", "RevSubscriptionManagement"],
  "settings": {}
}
```

### B2C Commerce

```json
{
  "features": ["B2CCommerceGMV", "B2CLoyaltyManagement", "B2CLoyaltyManagementPlus"],
  "settings": {}
}
```

### Loyalty Cloud

```json
{
  "features": ["LoyaltyAnalytics", "LoyaltyEngine", "LoyaltyManagementStarter", "LoyaltyMaximumPartners:1", "LoyaltyMaximumPrograms:1", "LoyaltyMaxOrderLinePerHour:3500000", "LoyaltyMaxProcExecPerHour:500000", "LoyaltyMaxTransactions:50000000", "LoyaltyMaxTrxnJournals"],
  "settings": {}
}
```
