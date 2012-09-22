package controllers;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ObjectNode;

import models.Thing;
import play.*;
import play.mvc.*;

import views.html.*;
import views.html.defaultpages.error;

public class Application extends Controller {
  private static ObjectMapper mapper = new ObjectMapper();
  
  public static Result index() {
    return ok(index.render("Your new application is ready."));
  }

  
  public static Result thingclient() {
    return ok(thingclient.render());
  }

  /*
   * Accepts a JSON object (which represents a Thing or a fragment of a Thing)
   * and uses it to create a new Thing in the database. Returns a full copy of
   * the stored thing as josn.
   */

  @BodyParser.Of(play.mvc.BodyParser.Json.class)
  public static Result create() throws JsonParseException, JsonMappingException, IOException {
    JsonNode json = request().body().asJson();
    Thing thing = mapper.treeToValue(json, Thing.class);
    thing.save();
    return ok(mapper.valueToTree(thing));
  }

  /*
   * Returns a full copy of a single Thing.
   */
  public static Result readOne(Long id) {
    Thing thing = Thing.find.byId(id);
    if(thing == null){
      return notFound("No such Thing with id " +  id);
    }else{
    JsonNode json = mapper.valueToTree(thing);
      return ok(json);
    }
  }

  /*
   * Returns a full copy of all Things.
   */
  public static Result readAll() {
    List<Thing> things = Thing.find.all();
    JsonNode json = mapper.valueToTree(things);
    return ok(json);
  }

  /*
   * Updates a single Thing using the fields posted as json.
   */
  @BodyParser.Of(play.mvc.BodyParser.Json.class)
  public static Result update(Long id) throws JsonParseException, JsonMappingException, IOException {
    JsonNode json = request().body().asJson();
    Thing thing = mapper.treeToValue(json, Thing.class);
    thing.update();
    return ok();
  }

  /*
   * Updates a single Thing using the fields posted as json.
   */
  public static Result delete(Long id) {
     Thing thing = Thing.find.byId(id);
     thing.delete();
     return ok();
  }
}