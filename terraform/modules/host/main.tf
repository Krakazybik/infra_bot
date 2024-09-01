terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    libvirt = {
      source = "dmacvicar/libvirt"
    }
  }
}

resource "random_pet" "tunnel" {}

resource "random_password" "linux_password" {
  length = 32
}

resource "random_password" "tunnel_secret" {
  length = 64
}

provider "cloudflare" {
  api_token = var.ct_token
}

resource "cloudflare_record" "ssh" {
  zone_id = var.cf_zone_id
  name    = "ssh-${random_pet.tunnel.id}"
  content = cloudflare_zero_trust_tunnel_cloudflared.tunnel.cname
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_record" "dev" {
  zone_id = var.cf_zone_id
  name    = "dev-${random_pet.tunnel.id}"
  content = cloudflare_zero_trust_tunnel_cloudflared.tunnel.cname
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_record" "web" {
  zone_id = var.cf_zone_id
  name    = "web-${random_pet.tunnel.id}"
  content = cloudflare_zero_trust_tunnel_cloudflared.tunnel.cname
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "email" {
  account_id = var.cf_account_id
  name       = "email policy"
  decision   = "allow"

  include {
    email = var.cf_allowed_email
  }
}

resource "cloudflare_zero_trust_access_application" "ssh" {
  zone_id          = var.cf_zone_id
  name             = "ssh-${random_pet.tunnel.id}"
  domain           = cloudflare_record.ssh.hostname
  session_duration = "24h"
  type             = "ssh"

  policies = [
    cloudflare_zero_trust_access_policy.email.id
  ]
}

resource "cloudflare_zero_trust_access_application" "dev" {
  zone_id          = var.cf_zone_id
  name             = "dev-${random_pet.tunnel.id}"
  domain           = cloudflare_record.dev.hostname
  session_duration = "24h"
  type             = "self_hosted"

  policies = [
    cloudflare_zero_trust_access_policy.email.id
  ]
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "tunnel" {
  account_id = var.cf_account_id
  name       = random_pet.tunnel.id
  secret     = base64sha256(random_password.tunnel_secret.result)
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "tunnel_config" {
  account_id = var.cf_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.tunnel.id

  config {
    warp_routing {
      enabled = true
    }
    ingress_rule {
      hostname = cloudflare_record.dev.hostname
      service  = "http://localhost:3000"
      origin_request {
        connect_timeout = "2m0s"
      }
    }
    ingress_rule {
      hostname = cloudflare_record.web.hostname
      service  = "http://localhost:80"
      origin_request {
        connect_timeout = "2m0s"
      }
    }
    ingress_rule {
      hostname = cloudflare_record.ssh.hostname
      service  = "ssh://localhost:22"
      origin_request {
        connect_timeout = "2m0s"
      }
    }
    ingress_rule {
      service = "http_status:404"
    }
  }
}

provider "libvirt" {
  uri = var.qemu_uri
}

variable "OL9-4-x86_64-kvm-b234" {
  default = "https://images.ws.lc/OL9U4_x86_64-kvm-b234.qcow2"
}

resource "libvirt_volume" "base" {
  name   = "OL9U4_x86_64-kvm-b234"
  source = var.OL9-4-x86_64-kvm-b234
}

resource "libvirt_volume" "volume" {
  name           = random_pet.tunnel.id
  base_volume_id = libvirt_volume.base.id
  size           = 50 * 1024 * 1024 * 1024
}

resource "libvirt_cloudinit_disk" "commoninit-x" {
  name = "${random_pet.tunnel.id}-commoninits.iso"
  user_data = templatefile("${path.module}/cloud_init.cfg", {
    password = random_password.linux_password.result,
    secret = base64encode(jsonencode({
      "a" = var.cf_account_id,
      "t" = cloudflare_zero_trust_tunnel_cloudflared.tunnel.id,
      "s" = base64sha256(random_password.tunnel_secret.result)
    }))
  })
}

resource "libvirt_domain" "master" {
  name      = random_pet.tunnel.id
  cloudinit = libvirt_cloudinit_disk.commoninit-x.id
  autostart = true

  cpu {
    mode = "host-passthrough"
  }

  vcpu   = 4
  memory = 4096

  disk {
    volume_id = libvirt_volume.volume.id
    scsi      = true
  }

  graphics {
    type        = "vnc"
    listen_type = "address"
  }

  network_interface {
    # network_id     = libvirt_network.network.id
    network_name   = "nat"
    hostname       = random_pet.tunnel.id
    wait_for_lease = true
  }
}



#resource "libvirt_network" "network" {
#  name      = random_pet.tunnel.id
#  mode      = "nat"
#  domain    = "${random_pet.tunnel.id}.local"
#  addresses = ["10.17.4.0/24"]
#
#  dns {
#    enabled    = true
#    local_only = true
#  }
#}
