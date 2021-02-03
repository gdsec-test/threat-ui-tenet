# Threat UI

Threat API is deployed and managed in AWS Fargate infrastructure.
Current region: `us-west-2`, account `GD-AWS-USA-GD-ThreatTools-Dev-Private`

Architecture contains of

1. DNS Domain record that points to Application Load Balancer (see https://cloud.int.godaddy.com/networking/dnsrecords/namespacerecords/threat.int.gdcorp.tools/ui.threat.int.gdcorp.tools%7C7121df59-2437-4672-8c93-2d2e2a193bf4)
2. Application Load Balancer `threat-ui-tenet-fargate` which targets to EC2 instances created and maintaned by AWS Fargate Cluster (see https://us-west-2.console.aws.amazon.com/ec2/v2/home?region=us-west-2#LoadBalancers:sort=loadBalancerName)
3. AWS Fargate Cluster `threat-ui-tenet-cluster` which manages set of EC2 instances running Docker containers of application inside of them (see https://us-west-2.console.aws.amazon.com/ecs/home?region=us-west-2#/clusters)
4. Container respository `com.godaddy.threat-ui-tenet` . It provides container images for (see https://us-west-2.console.aws.amazon.com/ecr/repositories?region=us-west-2#)

This document describes playbook for troubleshooting problems if anything goes wrong

So far the next alarms could be raised

## 1. `Site 24/7` service alarms for health check

`Site 24/7` service is set to visit `https://ui.threat.int.gdcorp.tools/healthcheck` page in browser. If page doesn't respond (usually 200 Status), alarm is raised and notifies in email\slack channels. Steps to troubleshoot:

1. go to `Site 24/7` to check details about monitor. See https://confluence.godaddy.com/display/ZTE/Create+a+Website+%28URL%29+Monitor
2. depending on HTML status code it may narrow the issue (see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status). Errors examples:

- `300s`: something is wrong with resourse by URL (redirect to wrong place)
- `400s`: unathorized\forbidden\restricted access to page. It might be 401\403 Single Sign On (slack #sso-support), 404 (page is deleted\not accessed from URL, see other logs of Gasket application)
- `500s`: failure inside actual Front-end Gasket Application(cannot compile\build)

## 2. `CloudWatch` alarms about Application Load Balancer failures

Check error codes for Application Load Balancer https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html for reference

1. Go to CloudWatch to check alarms
   https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#alarmsV2:?~(alarmStateFilter~'ALARM)
   Alarms identify issues with resource allocated for Application Load Balancer

2. Go to CloudWatch to check logs

Logs show console output of EC2 instance and other resources

## 3. `CloudWatch` alarms about Elastic Containers failures

1. Go to CloudWatch to check alarms
   https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#alarmsV2:?~(alarmStateFilter~'ALARM)
   (currently `TargetTracking-service/threat-ui-tenet-cluster/threat-ui-tenet-fargate-AlarmLow-6be14526-9a4e-4515-bcea-7aac3e0290e6` alarm is setup to check CPU Utilization by Containers)

2. Go to CloudWatch to check logs
   Logs show exact console output of each Task in Fargate. Task is scheduled job to deploy container and run it inside Fargate

(currently `/ecs/threat-ui-tenet-fargateTaskDefinition` log works at https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#logsV2:log-groups/log-group/$252Fecs$252Fthreat-ui-tenet-fargateTaskDefinition)
