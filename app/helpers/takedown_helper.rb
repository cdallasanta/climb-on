module TakedownHelper


  def climb_fields(rope)
    # for each rope, if they already have Climb objects, show those. If they don't,
    # make 4 blank ones.
    binding.pry
    if rope.climbs.where(takedown: @inspection.takedown) == []
      rope.climbs.create(takedown: @inspection.takedown)
    end
    
    render partial: "preuse_inspections/partials/climbs", locals: { takedown: @inspection.takedown }
  end
end
