export FORENSIC_USER_CREDS=$(aws secretsmanager get-secret-value --secret-id /Secrets/IAMUser/forensic-storage-user --query SecretString --output text)