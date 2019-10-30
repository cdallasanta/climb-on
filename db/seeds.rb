# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).


#Site
orkila = Site.new(name:"Orkila")

#Elements
catwalk = Element.create(name:"Catwalk", site: Site.find_by(name:"orkila"))
zipline = Element.create(name:"Zipline", site: Site.find_by(name:"orkila"))
giants_ladder = Element.create(name:"Giant's Ladder", site: Site.find_by(name:"orkila"))

#rope
Element::Rope.create(element:catwalk, identifier:"Olive with red pcord")
Element::Rope.create(element:catwalk, identifier:"Blue with red pcord")
Element::Rope.create(element:zipline, identifier:"North")
Element::Rope.create(element:zipline, identifier:"South")
Element::Rope.create(element:giants_ladder, identifier:"Red with orange pcord")
Element::Rope.create(element:giants_ladder, identifier:"White with orange pcord")
Element::Rope.create(element:giants_ladder, identifier:"Blue with orange pcord")

#Users
demo = User.new(
  fullname: "Demo User",
  email: "demo@email.com",
  password: "demopass",
  site: Site.find_by(name:"orkila"),
  role: "admin"
)
chris = User.new(
  fullname: "Chris Dalla Santa",
  email: "chris@email.com",
  password: "demopass",
  site: Site.find_by(name:"orkila"),
  role: "admin"
)

orkila.contact = demo
orkila.save