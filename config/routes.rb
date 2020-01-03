Rails.application.routes.draw do
  post "/graphql", to: "graphql#execute"

  namespace :api do
    namespace :v1 do
      resources :users, only: [:show, :create, :update]

      resources :sites, only: [:show] do
        get '/status/:date', to: "sites#status"
      end

      resources :elements, only: [:index, :show, :edit, :update] do
        # resources :ropes, only: [:new, :create, :update]
        resources :preuse_inspections, only: [:create, :update]
        get '/preuse_inspections/date/:date', to: "preuse_inspections#find_by_date"
        resources :periodic_inspections, only: [:create, :update]
        get '/periodic_inspections/date/:date', to: "periodic_inspections#find_by_date"
      end
    end
  end

  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'


  get '*path', to: "static_pages#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
