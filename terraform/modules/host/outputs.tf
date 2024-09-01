output "ssh_url" {
  value = cloudflare_zero_trust_access_application.ssh.domain
}

output "dev_url" {
  value = cloudflare_zero_trust_access_application.dev.domain
}

output "web_url" {
  value = cloudflare_record.web.hostname
}

output "internal_ip" {
  value = libvirt_domain.master.network_interface.0.addresses[0]
}

output "linux_password" {
  value     = random_password.linux_password.result
  sensitive = true
}

output "server_name" {
  value = random_pet.tunnel.id
}
