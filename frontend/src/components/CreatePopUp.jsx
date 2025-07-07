import Form from './Form';
import '@styles/popup.css';
import CloseIcon from '@assets/XIcon.svg';
import QuestionIcon from '@assets/QuestionCircleIcon.svg';

export default function Popup({ show, setShow, data, action}) {
    const userData = data && data.length > 0 ? data[0] : {};

    const handleCreate = (formData) => {
        action(formData);
    };

    const patternRut = new RegExp(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/);
    return (
        <div>
            { show && (
                <div className="bg">
                    <div className="popup">
                        <button className='close' onClick={() => setShow(false)}>
                            <img src={CloseIcon} />
                        </button>
                        <Form
                            title="Crear Usuario"
                            fields={[
                                {
                                label: "Nombre",
                                name: "nombre",
                                defaultValue: userData.nombre || "",
                                placeholder: 'Diego Alexis',
                                fieldType: 'input',
                                type: "text",
                                required: true,
                                minLength: 3,
                                maxLength: 50,
                                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                patternMessage: "Debe contener solo letras y espacios",
                            },
                            {
                                label: "Apellido",
                                name: "apellido",
                                defaultValue: userData.apellido || "",
                                placeholder: 'Salazar Jara',
                                fieldType: 'input',
                                type: "text",
                                required: true,
                                minLength: 3,
                                maxLength: 50,
                                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                patternMessage: "Debe contener solo letras y espacios",
                            },
                            {
                                label: "Rut",
                                name: "rut",
                                defaultValue: userData.rut || "",
                                placeholder: '21.308.770-3',
                                fieldType: 'input',
                                type: "text",
                                minLength: 9,
                                maxLength: 12,
                                pattern: patternRut,
                                patternMessage: "Debe ser xx.xxx.xxx-x o xxxxxxxx-x",
                                required: true,
                            },
                            {
                                label: "Direccion",
                                name: "direccion",
                                defaultValue: userData.direccion || "",
                                placeholder: 'Pasaje 4 Casa 2',
                                fieldType: 'input',
                                type: "text",
                                minLength: 3,
                                maxLength: 50,
                                required: true,
                            },
                            {
                                label: "Telefono",
                                name: "telefono",
                                defaultValue: userData.telefono || "",
                                placeholder: '+569XXXXXXXX',
                                fieldType: 'input',
                                type: "text",
                                minLength: 12,
                                maxLength: 12,
                                patternMessage: "El número telefónico debe tener 12 dígitos",
                                required: true,
                            },
                            {
                                label: "Correo electrónico",
                                name: "email",
                                defaultValue: userData.email || "",
                                placeholder: 'example@gmail.cl',
                                fieldType: 'input',
                                type: "email",
                                required: true,
                                minLength: 15,
                                maxLength: 30,
                            },
                            {
                                label: "Rol",
                                name: "rol",
                                fieldType: 'select',
                                options: [
                                    { value: 'administrador', label: 'Administrador' },
                                    { value: 'vecino', label: 'Vecino' },
                                    { value: 'Presidente', label: 'Presidenta/e' },
                                    { value: 'Secretario', label: 'Secretaria/o' },
                                    { value: 'Tesorero', label: 'Tesorera/o' }
                                ],
                                required: true,
                                defaultValue: userData.rol || "",
                            },
                            {
                                label: (
                                    <span>
                                        Contraseña
                                        <span className='tooltip-icon'>
                                            <img src={QuestionIcon} />
                                            <span className='tooltip-text'>Este campo es obligatorio</span>
                                        </span>
                                    </span>
                                ),
                                name: "password",
                                placeholder: "**********",
                                fieldType: 'input',
                                type: "password",
                                required: true,
                                minLength: 8,
                                maxLength: 26,
                                pattern: /^[a-zA-Z0-9]+$/,
                                patternMessage: "Debe contener solo letras y números",
                            },
                            {
                                label: "Estado de Actividad",
                                name: "estado_activo",
                                fieldType: 'select',
                                options: [
                                    {value: 'true', label: 'Activo'},
                                    {value: 'false', label: 'Inactivo'}
                                ],
                                required: true
                            }
                            ]}
                            onSubmit={handleCreate}
                            buttonText="Crear Usuario"
                            backgroundColor={'#fff'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
