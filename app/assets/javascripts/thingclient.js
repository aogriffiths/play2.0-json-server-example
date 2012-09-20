
window.ThingModel = Backbone.Model.extend({
  urlRoot:"/thing",
  
  defaults: {
    id:null,
    name:''
  }
});


window.ThingCollection = Backbone.Collection.extend({
  model:ThingModel,
  url:"/thing" ,
  initialize: function() {
    this.bind('reset', this.onreset, this)
  },
  onreset:function(evt){
  }
});

// Views

/*
 * A Backbone.View for a ThingCollection, renders Things Resources as a list i.e.
 * in a 'ul' tag.
 */

window.ThingListView = Backbone.View.extend({
    /*
     * First set of options specify the parent tag (which will be pointed to by
     * this.el) which the view will be drawn into. From the backbone.js
     * documentation: "this.el is created from the view's tagName, className, id
     * and attributes properties, if specified. If not, el is an empty div."
     */
    tagName:'div',
        
    id: "restModelList",
    
    template:_.template($('#thinglist').html()),
    
    /*
     * initialize is called when the view is first created. It is expected this
     * view will be created with a model of type ResourceCollection e.g. : new
     * ResourceListView({model:<ResourceCollection>}) suitable render function
     * are bound to ResourceCollection events.
     */
    initialize:function () {
        // reset is fired when a bulk change is required.
        this.model.bind("reset", this.render,            this);
        // add is fired when a single Resource is added to the
        // ResourceCollection
        this.model.bind("add",   this.render_on_add, this);
    },
    
    events: {
      "click    .new"       : "donew"
    },
    
    donew: function(){
      var n = new ThingModel();
      var a = app.thingCollection.add(n);
      a;
    },
      
    /*
     * render is called whenever the entire view needs to be re-drawn. It's
     * worth clearing the view first, just in case render is called more than
     * once, e.g. after a model is sorted or re-fetched from the server.
     */ 
    render:function (eventName) {
        $(this.el).html(this.template());
        this.table_el = $(this.el).find("table");
        _.each(this.model.models, this.addSingleThing, this);
        return this;
    },
    
    /*
     * render_on_add is called whenever a single Resource is added to the
     * ResourceCollection (as per the bind, made in the initialize function
     * above).
     */
    render_on_add:function(model){
      var thingListItemView = this.addSingleThing(model);
      if(model.isNew()){
        thingListItemView.doquickedit();
      }
      return this;
    },
    /*
     * Not a standard backbone.js function, but to key the code DRY this
     * function is used by the main render function and off the back of the add
     * event.
     */
    addSingleThing: function(model) {
      var thingListItemView = new ThingListItemView({model:model})
      $(this.table_el).append(thingListItemView.render().el);
      return thingListItemView;
    }

});


/*
 * A Backbone.View for a Thing item as rendered in a ThingList
 */

window.ThingListItemView = Backbone.View.extend({
  
    tagName:'tr',
    
    className: "model-item",

    template:_.template($('#thinglistitem').html()),
 
    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.remove, this);
    },
    
    render:function (eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
    events: {
      "click    .qed"       : "doquickedit",
      "click    .fed"       : "dofulledit",
      "click    .del"       : "dodelete",
      "click    .sav"       : "dosave",
      "click    .cls"       : "doclose"
    },
    
    doquickedit: function(){
      this.$el.addClass("editing"); 
      return false; //don't follow the href link
    },

    dofulledit: function(){
      app.doedit(this.model.id);
      return false; //don't follow the href link
    },

    dodelete: function(){
      this.model.destroy();     
      return false; //don't follow the href link
    },
    
    dosave: function(){
      var that = this;
      function getval(sel){
        return that.$el.find(sel).val();
      }
      var newmodel = {};
      newmodel.name = getval(".input_name");
      this.model.save(newmodel);
      this.$el.removeClass("editing");    
      return false; //don't follow the href link
    },
    
    doclose: function(){
      this.render(); //clean the view
      this.$el.removeClass("editing");
      return false; //don't follow the href link
    }
});


/*
 * A Backbone.View for editing a Thing item, 
 */

window.ThingEditItemView = Backbone.View.extend({
  
    tagName:'div',
    
    className: "model-item",

    template:_.template($('#thingedititem').html()),
 
    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.unrender, this);
    },
    
    render:function (eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

    events: {
      "click    .sav"       : "dosave",
      "click    .cls"       : "doclose"
    },    
    
    dosave: function(){
      var that = this;
      function getval(sel){
        return that.$el.find(sel).val();
      }
      var newmodel = {};
      newmodel.name = getval(".input_name");
      newmodel.contenttype = getval(".input_contenttype");
      newmodel.content = getval(".textarea_content");
      this.model.save(newmodel);
      app.dolist();
      return false; //don't follow the href link
    },
    
    doclose: function(){
      app.dolist();
      return false; //don't follow the href link
    }
});


// Router
var AppRouter = Backbone.Router.extend({
 
    routes:{
        ""          : "dolist",
        "!edit/:id" : "doedit"
      },
    
    initialize:function () {
        this.thingCollection = new ThingCollection();
        this.thingCollection.fetch();
    },
    
    dolist:function () {
        this.thingListView = new ThingListView({model:this.thingCollection});
        $('#main').html(this.thingListView.render().el);
        app.navigate('', false);
    },
    doedit:function (id) {
        var m = this.thingCollection.get(id);
        this.thingEditItemView = new ThingEditItemView({model:m});
        $('#main').html(this.thingEditItemView.render().el);
        app.navigate('!edit/' + id, false);
    }

 
});
 
var app = new AppRouter();
Backbone.history.start();