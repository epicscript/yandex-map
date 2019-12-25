ymaps.ready(init);

const INITIAL_OBJ_COUNT = 15;
const mapCenter = [51.15, 71.43];

function init() {
  const formTemplate = document.querySelector("#formTemplate").innerHTML;
  const renderForm = Handlebars.compile(formTemplate);
  const map = new ymaps.Map("map", {
    center: mapCenter, //Нур-Султан
    zoom: 11
  });

  const cluster = new ymaps.Clusterer({
    preset: "islands#invertedVioletClusterIcons",
    clusterDisableClickZoom: true,
    // openBalloonOnClick: false,
    // Устанавливаем стандартный макет балуна кластера "Карусель".
    clusterBalloonContentLayout: "cluster#balloonCarousel",
    // В данном примере балун никогда не будет открываться в режиме панели.
    clusterBalloonPanelMaxMapArea: 0,
    // Устанавливаем размеры макета контента балуна (в пикселях).
    clusterBalloonContentLayoutWidth: 200,
    clusterBalloonContentLayoutHeight: 160,
    // Устанавливаем максимальное количество элементов в нижней панели на одной странице
    clusterBalloonPagerSize: 5
  });

  for (let i = 0; i < INITIAL_OBJ_COUNT; i++) {
    const placemark = new ymaps.Placemark(
      getRandomPosition(),
      {
        balloonContentBody: renderForm()
      },
      {
        iconLayout: "default#image",
        iconImageHref: "img/objIcon.png",
        iconImageSize: [44, 66]
      }
    );

    placemark.events.add("click", placemarkClickHandler);
    placemark.balloon.events.add("open", balloonOpenHandler);

    map.geoObjects.add(placemark);
    cluster.add(placemark);
  }

  map.geoObjects.add(cluster);

  function placemarkClickHandler(e) {
    const placemark = e.get("target");

    getAddress(placemark.geometry.getCoordinates()).then(res => {
      const headerTemplate = document.querySelector("#headerTemplate")
        .innerHTML;
      const renderHeader = Handlebars.compile(headerTemplate);

      placemark.properties.set(
        "balloonContentHeader",
        renderHeader({ address: res })
      );
    });
  }

  function balloonOpenHandler(e) {
    const submitButton = document.getElementById("add");
    const nameInput = document.getElementById("input-name");
    const nameLocation = document.getElementById("input-location");

    console.log("sub", submitButton);

    submitButton.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("clicked");
    });
  }
}

function getRandomPosition() {
  return [
    mapCenter[0] + (Math.random() * 0.2 - 0.12),
    mapCenter[1] + (Math.random() * 0.3 - 0.1)
  ];
}

function getAddress(coords) {
  return new Promise((resolve, reject) => {
    ymaps
      .geocode(coords)
      .then(res => {
        const firstGeoObject = res.geoObjects.get(0);
        resolve(firstGeoObject.getAddressLine());
      })
      .catch(error => {
        reject(error);
      });
  });
}
