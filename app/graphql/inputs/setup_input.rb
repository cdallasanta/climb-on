class Inputs::SetupInput < Types::BaseInputObject
  graphql_name "SetupInput"

  argument :id, Integer, required: false
  argument :sectionsAttributes, [Inputs::SectionInput], as: :sections_attributes, required: true
end