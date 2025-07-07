import Form from './Form';
import '@styles/popup.css';
import CloseIcon from '@assets/XIcon.svg';
import QuestionIcon from '@assets/QuestionCircleIcon.svg';
import { useAuth } from '../context/AuthContext';

export default function Popup({ show, setShow, data, action }) {
    const { user, setUser } = useAuth();
    const esVecino = user?.rol?.toLowerCase() === 'vecino';
    const userData = data && data.length > 0 ? data[0] : {};

    const handleSubmit = (formData) => {
        console.log("Datos:", formData);
        const rut = esVecino ? user.rut : userData.rut;
        action(formData, rut, user, setUser);
    };

    const patternRut = new RegExp(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/);
    return (
        <div>
            {show && (
                <div className="bg">
                    <div className="popup">
                        <button className='close' onClick={() => setShow(false)}>
                            <img src={CloseIcon} />
                        </button>
                        <Form
                            title="Editar usuario"
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
                                    disabled: esVecino
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
                                    disabled: esVecino
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
                                    label: "Telefono",
                                    name: "telefono",
                                    defaultValue: userData.telefono || "",
                                    placeholder: '+569XXXXXXXX',
                                    fieldType: 'input',
                                    type: "tel",
                                    required: true,
                                    minLength: 12,
                                    maxLength: 12,
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
                                    disabled: esVecino
                                },
                                {
                                    label: "Rol",
                                    name: "rol",
                                    fieldType: 'select',
                                    options: [
                                        { value: 'administrador', label: 'Administrador' },
                                        { value: 'vecino', label: 'Vecino' },
                                        { value: 'presidente', label: 'Presidenta/e' },
                                        { value: 'secretario', label: 'Secretaria/o' },
                                        { value: 'tesorera', label: 'Tesorera/o' }
                                    ],
                                    required: false,
                                    defaultValue: userData.rol || "", 
                                    //disabled: esVecino
                                },
                                {
                                    label: (
                                        <span>
                                            Nueva contraseña
                                            <span className='tooltip-icon'>
                                                <img src={QuestionIcon} />
                                                <span className='tooltip-text'>Este campo es opcional</span>
                                            </span>
                                        </span>
                                    ),
                                    name: "newPassword",
                                    placeholder: "**********",
                                    fieldType: 'input',
                                    type: "password",
                                    required: false,
                                    minLength: 8,
                                    maxLength: 26,
                                    pattern: /^[a-zA-Z0-9]+$/,
                                    patternMessage: "Debe contener solo letras y números",
                                }
                            ]}
                            onSubmit={handleSubmit}
                            buttonText="Editar usuario"
                            backgroundColor={'#fff'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}