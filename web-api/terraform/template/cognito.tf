resource "aws_cognito_user_pool" "pool" {
  name = "efcms-${var.environment}"

  auto_verified_attributes = ["email"]

  username_attributes = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_LINK"
    email_message_by_link = "Please click the link below to verify your email address. {##Verify Email##} "
    email_subject_by_link = "U.S. Tax Court account verification"
  }

  sms_authentication_message = "{####}"

  lifecycle {
    prevent_destroy = true
  }

  lambda_config {
    post_confirmation = "${aws_lambda_function.cognito_post_confirmation_lambda.arn}"
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
    invite_message_template {
      sms_message = "Your username is {username} and temporary password is {####}."
      email_subject = "U.S. Tax Court account creation"
      email_message = "An account has been created for you on the <a href='https://ui-dev.ustc-case-mgmt.flexion.us/'>U.S. Tax Court site</a>. Your username is {username} and temporary password is {####}. Please log in and change your password."
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 255
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "role"
    required            = false
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 255
    }
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 0
      max_length = 255
    }
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "client"

  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH"]

  generate_secret                      = false
  refresh_token_validity               = 30
  allowed_oauth_flows_user_pool_client = true

  callback_urls = [
    "http://localhost:1234/log-in",
    "https://ui-${var.environment}.${var.dns_domain}/log-in",
  ]

  allowed_oauth_flows          = ["code", "implicit"]
  allowed_oauth_scopes         = ["email", "openid", "profile", "phone", "aws.cognito.signin.user.admin"]
  supported_identity_providers = ["COGNITO"]

  user_pool_id = "${aws_cognito_user_pool.pool.id}"
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "auth-${var.environment}-${var.cognito_suffix}"
  user_pool_id = "${aws_cognito_user_pool.pool.id}"
}
