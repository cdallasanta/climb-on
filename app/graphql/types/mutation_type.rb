class Types::MutationType < Types::BaseObject
  field :create_user, mutation: Mutations::CreateUser
  field :sign_in_user, mutation: Mutations::SignInUser
  field :sign_out_user, mutation: Mutations::SignOutUser
  field :savePeriodic, mutation: Mutations::SavePeriodic
  field :savePreuse, mutation: Mutations::SavePreuse
end
