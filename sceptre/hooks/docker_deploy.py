from sceptre.hooks import Hook
import argparse
import shlex
import base64
import docker
import os
from botocore.exceptions import ClientError

class Deploy(Hook):

    def __init__(self, *args, **kwargs):
        super(Deploy, self).__init__(*args, **kwargs)
        self.parser = argparse.ArgumentParser()

    def add_args(self):
        self.parser.add_argument("-p", "--path", required=True, type=str,
                                 help="Relative path from project root to the project to deploy")
        self.parser.add_argument("-s", "--service_name", required=True, type=str,
                                 help="The name of the service")

    def run(self):

        self.add_args()
        self.args = self.parser.parse_args(shlex.split(self.argument))

        dockerClient = docker.from_env()
        path = self.args.path
        service_name = self.args.service_name
        account_number = None
        ecr = None
        creds = None
        tag = 'latest'
       
        self.logger.info(f'*** Running deploy hook for {self.stack.name}')

        try:
            self.logger.info(f'*** Fetching the account number')
            repositoryNames = [service_name]
            idenity = self.stack.template.connection_manager.call('sts', 'get_caller_identity')
            account_number = idenity['Account']
        except ClientError:
            raise Exception(f'Error calling get_caller_identity.')


        try:
            self.logger.info(f'*** Fetching the repo uri for {service_name}')
            repositoryNames = [service_name]
            repos = self.stack.template.connection_manager.call('ecr', 'describe_repositories', kwargs=dict(repositoryNames=repositoryNames))
            ecr = repos['repositories'][0]['repositoryUri']
        except ClientError:
            raise Exception(f'Error calling describe_repositories.')

        try:
            self.logger.info(f'*** Authorizing')
            # remove stored docker creds
            os.remove('/home/025c4f850a16ecm/.docker/config.json')
            creds = self.stack.template.connection_manager.call('ecr', 'get_authorization_token', kwargs=dict(registryIds=[account_number]))
        except ClientError:
            raise Exception(f'Error calling get_authorization_token.')


        username, password = base64.b64decode(creds['authorizationData'][0]['authorizationToken']).decode().split(':')
        registry = creds['authorizationData'][0]['proxyEndpoint']        

        self.logger.info(f'*** building image from  {path}')
        image, build_log = dockerClient.images.build(path=path, gzip=False, tag=service_name)
        image.tag(ecr, tag='latest')
        
        self.logger.info(f'*** logging into the Docker client')
        dockerClient.login(username=username, password=password, registry=registry)
        
        self.logger.info(f'*** pushing image to {ecr}')
        push_log = dockerClient.images.push(ecr, tag='latest')
        self.logger.info(f'**push_log={push_log}')

        