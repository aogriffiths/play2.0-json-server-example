
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
 * A Backbone.View for a ThingCollection, renders Things Resources as a list
 * i.e. in a 'ul' tag.
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
      app.linkvieweventtoroute(this, "click", ".fed", "doedit", "id");   
      this.delegateEvents();  
      return this;
    },
    
    events: {
      "click    .qed"       : "doquickedit",
      "click    .del"       : "dodelete",
      "click    .sav"       : "dosave",
      "click    .cls"       : "doclose"
    },
    
    doquickedit: function(){
      this.$el.addClass("editing"); 
      return false; // don't follow the href link
    },

    dofulledit: function(){
      app.doedit(this.model.id);
      return false; // don't follow the href link
    },

    dodelete: function(){
      this.model.destroy();     
      return false; // don't follow the href link
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
      return false; // don't follow the href link
    },
    
    doclose: function(){
      this.render(); // clean the view
      this.$el.removeClass("editing");
      return false; // don't follow the href link
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
      "click    .cls"       : "doclose",
      "click    .chr"       : "docreatechars"
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
      return false; // don't follow the href link
    },
    
    doclose: function(){
      app.dolist();
      return false; // don't follow the href link
    },
    
    docreatechars: function(){
      /*
       *Special characters are escaped with \
       */
      
      var str = "UNICODE_START:";      
      for(var i = 32; i <688; i++){ //A decent chunk of interesting characters
        str += String.fromCharCode(i);
      }
      str += "UNICODE_END"
      
      var a="\" \\ \/ \b \f \n \r \t";
      var b="\"\\\" \\\\ \/ \\b \\f \\n \\r \\t\"";
      var c=JSON.stringify(a);
      c==b;
      
      var ctrl = "CTRL_START:" + a + "CTRL_END";
          
      this.$el.find(".textarea_content").val(ctrl + str); 
      var json = JSON.stringify(str);
      var diff = 0
      for(var i=0; i < str.length ; i++){
        //danger
        while(str.charAt(i) !=  json.charAt(i+diff)){
          console.info(json.charAt(i+diff) + json.charAt(i+diff+1));
          diff ++;
        }
      }
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
      /* Fetch a base set of Things to get started with
       * this is asynchronous so the route callbacks (dolist / doedit)
       * are likely to get called before the fetch returns a list of 
       * models. dolist will render empty and the re-render on the 
       * reset event. doedit handels this scenario with the "m === null"
       * check.
       */

      this.thingCollection.fetch();
      
      /*
       * this.thingCollection.fetch({ success:function () { x; } });
       */
    },
    
    dolist:function () {
      this.thingListView = new ThingListView({model:this.thingCollection});
      $('#main').html(this.thingListView.render().el);
      app.navigate('', false);
    },

    doedit:function (id) {
      var m = this.thingCollection.get(id);
      /* m will be null if the thingCollection, for any reason, does not
       * contain the model with this id. This could happen if the
       * thingCollection.fetch() from the initialize has not returned yet.
       * Handle these scenarios with a direct request for a single Thing.
       */
      var thisapp = this;
      if(!m){
        m = new ThingModel({id:id});
        m.fetch({
          success:function () {
            thisapp.doedit_ofmodel(m);
          },
          error:function(){
            //TODO
            true;
          }
        });
      }else{
        thisapp.doedit_ofmodel(m);
      }
    },
  
    doedit_ofmodel:function (m) {
      this.thingEditItemView = new ThingEditItemView({model:m});
      $('#main').html(this.thingEditItemView.render().el);
      app.navigate('!edit/' + m.id  , false);
    },
    
    // e.g. app.routeclick(this, "click", ".link", "do", "id");
    linkvieweventtoroute: function(view, event, selector, callback, param){
      var events = {};
      var parent_app = this;
      var value = view.model.get(param);
      var routefunction = function(){
        parent_app[callback](value);
        return false;
      }
      events[event + ' ' + selector] = routefunction;
      view.delegateEvents(events);   
      var key = null;
      for(key in this.routes){
        if(this.routes[key]==callback){
          break;
        }
      }
      if(key !== null){
        var href = key.replace(':' + param, value);
        view.$el.find(selector).attr("href", "#" + href);
      }           
    }
 
});
 
var app = new AppRouter();
Backbone.history.start();