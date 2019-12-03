class CreateSections < ActiveRecord::Migration[6.0]
  def change
    create_table :sections do |t|
      t.string :title
      t.string :instructions
      t.references :inspection, polymorphic: true, index: true
    end
  end
end
