#!/bin/bash

set -e

docker --version
aws --version

[ -z "$TRAVIS_BUILD_DIR" ] && DOCKER_DIR=. || DOCKER_DIR=$TRAVIS_BUILD_DIR
[[ -z "$TRAVIS_COMMIT" ]] && TRAVIS_COMMIT=HEAD
echo $TRAVIS_COMMIT

commit=$(git rev-parse --short=7 $TRAVIS_COMMIT)

# AWS global settings
account_id=$(aws sts get-caller-identity --output text --query 'Account')
region_id=us-west-2

# ECS settings
registry_url=${account_id}.dkr.ecr.${region_id}.amazonaws.com/savant-ide-api
application=savant-ide-api
deployment_grp=savant-ide-api
cluster=savant-ide-api
service=savant-ide-api
task=savant-ide-api

function getCurrentTaskDefinition() {
  TASK_DEFINITION=$(aws ecs describe-task-definition --task-def $task)
}

function createNewTaskDefJson() {
    # Get a JSON representation of the current task definition
    DEF=$( echo "$TASK_DEFINITION" | jq '.taskDefinition' )

    # Default JQ filter for new task definition
    NEW_DEF_JQ_FILTER="family: .family, volumes: .volumes, containerDefinitions: .containerDefinitions"

    # Some options in task definition should only be included in new definition if present in
    # current definition. If found in current definition, append to JQ filter.
    CONDITIONAL_OPTIONS=(networkMode taskRoleArn placementConstraints)
    for i in "${CONDITIONAL_OPTIONS[@]}"; do
      re=".*${i}.*"
      if [[ "$DEF" =~ $re ]]; then
        NEW_DEF_JQ_FILTER="${NEW_DEF_JQ_FILTER}, ${i}: .${i}"
      fi
    done

    # Build new DEF with jq filter
    echo "$DEF" | jq "{${NEW_DEF_JQ_FILTER}}" > task-defn.json
}

function createNewAppSpec() {
  cat << EOF > app-spec.json
{
  "version": 1,
  "Resources": [
    {
      "TargetService": {
        "Type": "AWS::ECS::Service",
        "Properties": {
          "TaskDefinition": "{{ PLACEHOLDER }}",
          "LoadBalancerInfo": {
            "ContainerName": "savant-ide-api",
            "ContainerPort": 8080
          }
        }
      }
    }
  ]
}
EOF
}

function deploy() {
  aws ecs deploy \
    --cluster $cluster \
    --service $service \
    --task-definition ./task-defn.json \
    --codedeploy-appspec ./app-spec.json \
    --codedeploy-application $application \
    --codedeploy-deployment-group $deployment_grp
}

echo "Building container..."
eval "$(aws ecr get-login --no-include-email --region $region_id)"
docker build -t "$registry_url:latest" -t "$registry_url:$commit" "$DOCKER_DIR"

echo "Pushing to ECR..."
docker push "$registry_url"

echo "Deploying to ECS..."
getCurrentTaskDefinition
createNewTaskDefJson
createNewAppSpec
deploy

