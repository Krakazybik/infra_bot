variable "cf_account_id" {
  default = ""
  type    = string
}

variable "cf_zone_id" {
  default = ""
  type    = string
}

variable "ct_token" {
  default = ""
  type    = string
}

variable "qemu_uri" {
  default = ""
  type    = string
}

variable "cf_allowed_email" {
  default = []
  type    = list(string)
}
