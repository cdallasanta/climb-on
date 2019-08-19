module ApplicationHelper
  # adds form errors to the top of the form
  def errors_check(object)
    if object.errors.any?
      render partial: 'application/errors', locals: {object: object}, class: "alert alert-error fields_with_errors"
    end
  end

  # will need this once I add in JS
  # def javascript_exists?
  #   script = "#{Rails.root}/app/assets/javascripts/#{params[:controller]}.js"
  #   File.exists?(script) || File.exists?("#{script}.coffee") 
  # end

  def stylesheet_exists?
    script = "#{Rails.root}/app/assets/stylesheets/#{params[:controller]}.scss"
    File.exists?(script) || File.exists?("#{script}.erb") 
  end
end
