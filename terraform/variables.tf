variable "cf_account_id" {
  type = string
}

variable "cf_zone_id" {
  type = string
}

variable "ct_token" {
  type = string
}

variable "qemu_uri" {
  type = string
}

variable "cf_allowed_email" {
  default = []
  type    = list(string)
}
