# Scheduled Jobs Endpoints Status

## Total Endpoints in Service: 51 (All endpoints from API spec)

### ✅ Connected Endpoints (18 - Used in UI)

#### CRUD Operations

1. ✅ `listScheduledJobs` - ScheduledJobsPage
2. ✅ `searchScheduledJobs` - ScheduledJobsPage
3. ✅ `getScheduledJobById` - ScheduledJobDetailsPage, CreateScheduledJobPage
4. ✅ `createScheduledJob` - CreateScheduledJobPage
5. ✅ `updateScheduledJob` - CreateScheduledJobPage
6. ✅ `deleteScheduledJob` - ScheduledJobDetailsPage

#### Status Management

7. ✅ `activateScheduledJob` - ScheduledJobDetailsPage
8. ✅ `deactivateScheduledJob` - ScheduledJobDetailsPage
9. ✅ `pauseScheduledJob` - ScheduledJobDetailsPage
10. ✅ `archiveScheduledJob` - ScheduledJobDetailsPage

#### Analytics

11. ✅ `getCountByStatus` - ScheduledJobsPage (displayed in stat cards)
12. ✅ `getCountByType` - ScheduledJobsPage (fetched, ready for display)
13. ✅ `getCountByOwner` - ScheduledJobsPage (fetched, ready for display)

#### Tags Management

14. ✅ `addTags` - ScheduledJobDetailsPage
15. ✅ `removeTag` - ScheduledJobDetailsPage

#### Notification Recipients

16. ✅ `addNotificationRecipients` - ScheduledJobDetailsPage
17. ✅ `removeNotificationRecipient` - ScheduledJobDetailsPage

---

### ✅ Available in Service (22 - Not yet used in UI)

#### Search/List Endpoints

1. ✅ `getActiveJobs` - GET /active
2. ✅ `getSlaBreachJobs` - GET /sla-breach
3. ✅ `getStaleJobs` - GET /stale
4. ✅ `getDueForExecutionJobs` - GET /due-for-execution

#### Batch Operations

5. ✅ `batchActivate` - POST /batch/activate
6. ✅ `batchDeactivate` - POST /batch/deactivate
7. ✅ `batchPause` - POST /batch/pause
8. ✅ `batchArchive` - POST /batch/archive
9. ✅ `batchDelete` - POST /batch/delete

#### Additional Analytics

10. ✅ `getExecutionStatistics` - GET /analytics/execution-statistics
11. ✅ `getSlaCompliance` - GET /analytics/sla-compliance
12. ✅ `getFailureAnalysis` - GET /analytics/failure-analysis
13. ✅ `getMostFailed` - GET /analytics/most-failed
14. ✅ `getLongestRunning` - GET /analytics/longest-running
15. ✅ `getResourceUtilization` - GET /analytics/resource-utilization
16. ✅ `getHighFailureRate` - GET /analytics/high-failure-rate

#### Additional Lookup Filters

17. ✅ `getScheduledJobsByOwner` - GET /owner/:ownerId
18. ✅ `getScheduledJobsByTenant` - GET /tenant/:tenantId
19. ✅ `getScheduledJobsByScheduleType` - GET /schedule-type/:scheduleType
20. ✅ `getScheduledJobsByTag` - GET /tag/:tag
21. ✅ `getScheduledJobsByConnectionProfile` - GET /connection-profile/:profileId

#### Health & Monitoring

22. ✅ `getJobHealth` - GET /:id/health

---

### ❌ Not Connected Endpoints (11 - Available but not used in UI)

#### Lookup/Query Endpoints

1. ❌ `getScheduledJobByCode` - Not used in UI
2. ❌ `getScheduledJobByUuid` - Not used in UI
3. ❌ `getScheduledJobsByStatus` - Not used in UI
4. ❌ `getScheduledJobsByJobType` - Not used in UI

#### Execution Management

5. ❌ `updateExecutionStats` - Not used in UI
6. ❌ `updateLastRun` - Not used in UI
7. ❌ `updateNextRun` - Not used in UI
8. ❌ `incrementFailureCount` - Not used in UI
9. ❌ `resetFailureCount` - Not used in UI

#### Version Management

10. ❌ `createVersion` - Not used in UI
11. ❌ `rollbackVersion` - Not used in UI
12. ❌ `getVersions` - Not used in UI

---

## Summary

- **Total Endpoints in Service**: 51/51 (100% ✅)
- **Connected to UI**: 18/51 endpoints (35%)
- **Available but not used in UI**: 33/51 endpoints (65%)

### Endpoint Breakdown by Category

- **CRUD & Core**: 7 endpoints (all connected ✅)
- **Status Management**: 4 endpoints (all connected ✅)
- **Search/List**: 5 endpoints (1 connected, 4 available)
- **Batch Operations**: 5 endpoints (0 connected, 5 available)
- **Analytics**: 10 endpoints (3 connected, 7 available)
- **Lookup Filters**: 9 endpoints (2 connected, 7 available)
- **Execution Tracking**: 5 endpoints (0 connected, 5 available)
- **Tags/Notifications**: 4 endpoints (all connected ✅)
- **Versioning**: 3 endpoints (0 connected, 3 available)
- **Health**: 1 endpoint (0 connected, 1 available)

### Recommendations for Remaining Endpoints

**High Priority:**

- Version management (createVersion, rollbackVersion, getVersions) - Useful for job history/rollback
- Execution stats management (updateExecutionStats, resetFailureCount) - Useful for manual job management

**Low Priority:**

- Lookup endpoints (getScheduledJobByCode, getScheduledJobByUuid) - Can be added if needed for specific use cases
- Filter endpoints (getScheduledJobsByStatus, getScheduledJobsByJobType) - Already covered by search/list with filters
