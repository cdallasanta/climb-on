class PreuseInspection::Setup < ApplicationRecord
  self.table_name = "setups"
  belongs_to :preuse_inspection
  has_many :user_setups, class_name: "JoinTable::UserSetups"
  has_many :users, through: :user_setups
  has_many :sections, as: :inspection
  has_one :element, through: :preuse_inspection
  accepts_nested_attributes_for :sections

  after_initialize :create_sections

  def create_sections
    self.sections.new(title: "Element")
    self.sections.new(title: "Equipment")
    self.sections.new(title: "Environment")
  end
end
