module "host" {
  source = "./modules/host"

  cf_account_id    = var.cf_account_id
  cf_zone_id       = var.cf_zone_id
  ct_token         = var.ct_token
  qemu_uri         = var.qemu_uri
  cf_allowed_email = var.cf_allowed_email
}

output "ssh_url" {
  value = module.host.ssh_url
}

output "dev_url" {
  value = module.host.dev_url
}

output "web_url" {
  value = module.host.web_url
}

output "linux_password" {
  value     = module.host.linux_password
  sensitive = true
}

output "server_name" {
  value     = module.host.server_name
  sensitive = true
}
