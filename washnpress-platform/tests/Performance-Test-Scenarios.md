# Performance Test Scenarios

## Objectives
- Validate scalability behavior before production launch.
- Establish baseline for API and page performance.

## Scenarios

### PERF-01 Dashboard Read Load
- Endpoint/page: /
- Virtual users: 200 concurrent
- Duration: 15 minutes
- Success criteria: P95 page load < 2.5s, error rate < 1%

### PERF-02 Scheduling API Burst
- Endpoint: POST /api/schedule
- Load: 100 requests/sec for 10 minutes
- Success criteria: P95 < 300 ms, no 5xx spikes

### PERF-03 QC API Write Load
- Endpoint: POST /api/operations/qc
- Load: 50 requests/sec with mixed pass/fail payloads
- Success criteria: write latency stable, no data corruption

### PERF-04 Sustained Mixed Workflow
- Mix: login, schedule, processing updates, reporting reads
- Duration: 30 minutes
- Success criteria: stable memory/CPU, queue lag within SLA

### PERF-05 Soak Test
- Duration: 8 hours
- Target: detect memory leaks and resource exhaustion
- Success criteria: no progressive degradation

## Tooling
- k6 or JMeter
- APM and infrastructure metrics enabled

## Required Metrics
- Latency percentiles (P50/P90/P95/P99)
- Error rates by endpoint
- CPU/memory usage
- DB query latency and lock waits
