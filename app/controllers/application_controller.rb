class ApplicationController < ActionController::API

  def login!
    session[:user_id] = @user.id
  end

  def logged_in?
    !!session[:user_id]
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  # TODO check on this alter
  def authorized_user?
     @user == current_user
  end

  def logout!
    session.clear
  end

  def fallback_index_html
    binding.pry
    render :file => 'public/index.html'
  end
end
