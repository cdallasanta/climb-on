class User < ApplicationRecord
  belongs_to :site, optional: true
  has_many :periodic_inspections, class_name: "Inspection::PeriodicInspection"
  has_many :user_setups, class_name: "JoinTable::UserSetups"
  has_many :setups, through: :user_setups
  has_many :user_takedowns, class_name: "JoinTable::UserTakedowns"
  has_many :takedowns, through: :user_takedowns
  #has_many comments, something about polymorphism

  validates_presence_of :fullname
  validates :email, presence: true, uniqueness: true
  has_secure_password

  def is_admin?
    self.role == "admin"
  end

  def is_lead?
    self.role == "lead"
  end

  def has_permissions?(level)
    case level
    when "admin"
      self.is_admin?
    when "lead"
      self.is_lead? || self.is_admin?
    end
  end
end
